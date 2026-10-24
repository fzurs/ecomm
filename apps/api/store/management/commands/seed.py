import json
from datetime import timedelta
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.utils import timezone

from billing.models import Invoice
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
    help = 'Loads development data (brands, categories, products, customers and orders) from a JSON file.'

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
        # Invoices hold real ARCA numbering: never delete them from here.
        if Invoice.objects.exists():
            raise CommandError('There are invoices: --reset would delete their orders. Remove them by hand first.')
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
        self.stdout.write(f'Order: {len(rows)}')
