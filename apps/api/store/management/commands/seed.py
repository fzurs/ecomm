import json
from datetime import timedelta
from decimal import Decimal
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.test.utils import override_settings
from django.utils import timezone

from billing import services
from billing.arca import issuer_cuit
from billing.rules import InvoicingError
from billing.models import Invoice, InvoiceSequenceLock
from billing.sample import SAMPLE_POINT_OF_SALE, SampleWSFE
from orders.models import Customer, Order, OrderItem
from store.models import Brand, Category, Product

from .regenerate_images import is_generated

DEFAULT_PATH = settings.BASE_DIR / 'seed' / 'dev.json'


def lookup(model, names: dict, name: str, where: str):
    if name is None:
        return None
    if name not in names:
        raise CommandError(f'Unknown {model.__name__.lower()} "{name}" in {where}')
    return names[name]


class Command(BaseCommand):
    help = 'Loads development data (brands, categories, products, customers, orders and sample invoices) from a JSON file.'

    def add_arguments(self, parser):
        parser.add_argument('path', nargs='?', type=Path, default=DEFAULT_PATH)
        parser.add_argument('--reset', action='store_true', help='Delete the existing data before loading.')

    def handle(self, *args, path, reset, **options):
        try:
            data = json.loads(path.read_text())
        except (OSError, json.JSONDecodeError) as e:
            raise CommandError(f"Can't read {path}: {e}")

        with transaction.atomic():
            if reset:
                self.reset()
            self.load(data)

    def reset(self):
        # Invoices emitted to ARCA hold real numbering: never delete them from here. The seed's
        # samples (on their own point of sale) can go.
        if Invoice.objects.exclude(point_of_sale=SAMPLE_POINT_OF_SALE).exists():
            raise CommandError(
                'There are invoices emitted to ARCA: --reset would delete their orders. Remove them by hand first.')
        # Notes first: they protect their invoice and the lines they credit.
        Invoice.objects.exclude(associated_invoice=None).delete()
        Invoice.objects.all().delete()
        InvoiceSequenceLock.objects.filter(point_of_sale=SAMPLE_POINT_OF_SALE).delete()
        OrderItem.objects.all().delete()
        Order.objects.all().delete()
        for model in (Product, Customer):
            for obj in model.objects.all():
                if obj.image and is_generated(obj.image, obj.name):
                    obj.image.delete(save=False)
            model.objects.all().delete()
        Brand.objects.all().delete()
        Category.objects.all().delete()
        self.stdout.write('Existing data deleted')

    def load(self, data):
        brands = {name: Brand.objects.get_or_create(name=name)[0] for name in data.get('brands', [])}
        categories = {
            row['name']: Category.objects.update_or_create(name=row['name'], defaults=row)[0]
            for row in data.get('categories', [])
        }

        products = {}
        for row in data.get('products', []):
            where = f'product "{row["name"]}"'
            defaults = {
                **row,
                'brand': lookup(Brand, brands, row.get('brand'), where),
                'category': lookup(Category, categories, row.get('category'), where),
            }
            product = Product.objects.update_or_create(name=row['name'], defaults=defaults)[0]
            if not product.sku:
                product.generate_sku()
            products[product.name] = product

        customers = {
            row['name']: Customer.objects.update_or_create(name=row['name'], defaults=row)[0]
            for row in data.get('customers', [])
        }

        self.stdout.write(
            f'Brand: {len(brands)}, Category: {len(categories)}, '
            f'Product: {len(products)}, Customer: {len(customers)}'
        )

        rows = data.get('orders', [])
        # Orders have no natural key, so they are only created on an empty table.
        if Order.objects.exists():
            self.stdout.write('Order: skipped, there are orders already (use --reset to recreate them)')
            return
        now = timezone.now()
        orders = []
        for number, row in enumerate(rows, start=1):
            where = f'order #{number}'
            items = [
                {'product': lookup(Product, products, item['product'], where), 'quantity': item.get('quantity', 1)}
                for item in row['items']
            ]
            order = Order.objects.create_with_items(
                customer=lookup(Customer, customers, row['customer'], where),
                status=row.get('status', Order.Status.PENDING),
                items=items,
            )
            # `created_at` is auto_now_add, so it can only be backdated with an update.
            created_at = now - timedelta(days=row.get('days_ago', 0))
            Order.objects.filter(pk=order.pk).update(created_at=created_at, updated_at=created_at)
            order.created_at = created_at
            orders.append(order)
        self.stdout.write(f'Order: {len(rows)}')

        self.load_invoices(data.get('invoices', []), orders)

    # Made-up vouchers, emitted with `SampleWSFE` (no ARCA) on their own point of sale, as a
    # responsable inscripto: A and B invoices, notes, and the rejected and unverified states.
    # Their CAE and numbers are fictitious; emitting or verifying one again does call ARCA.
    @override_settings(
        ARCA_POINT_OF_SALE=SAMPLE_POINT_OF_SALE, ARCA_ISSUER_VAT_CONDITION='responsable_inscripto')
    def load_invoices(self, rows, orders):
        wsfe = SampleWSFE(cuit=issuer_cuit())
        for row in rows:
            where = f'invoice of order #{row["order"]}'
            if not 1 <= row['order'] <= len(orders):
                raise CommandError(f'Unknown order in {where}')
            order = orders[row['order'] - 1]
            # Invoiced when it was paid; it may have shipped since.
            status, order.status = order.status, Order.Status.PAID
            wsfe.fail = row.get('result')
            try:
                invoice = services.create_invoice(order, wsfe)
            except InvoicingError as e:
                raise CommandError(f"Can't create the {where}: {e}")
            finally:
                order.status, wsfe.fail = status, None
            self.backdate(invoice, order.created_at)

            for note in row.get('notes', []):
                invoice.refresh_from_db()
                lines = note.get('lines')
                if note['kind'] == 'credit_note':
                    if lines is not None:
                        by_description = {line.description: line for line in invoice.lines.all()}
                        lines = [(by_description[line['product']], line['quantity']) for line in lines]
                    created = services.create_credit_note(invoice, lines, wsfe)
                else:
                    lines = [{**line, 'unit_price': Decimal(line['unit_price'])} for line in lines]
                    created = services.create_debit_note(invoice, lines, wsfe)
                self.backdate(created, order.created_at + timedelta(days=note.get('days_after', 0)))
        self.stdout.write(f'Invoice: {Invoice.objects.count()}')

    @staticmethod
    def backdate(invoice, when):
        # Like orders, `created_at` can only be backdated with an update.
        fields = {'created_at': when, 'updated_at': when}
        if invoice.status == Invoice.Status.AUTHORIZED:
            fields |= {'issue_date': when.date(), 'cae_expiration_date': when.date() + timedelta(days=10)}
        Invoice.objects.filter(pk=invoice.pk).update(**fields)
