from django.core.management.base import BaseCommand

from orders.models import Order
from payments.models import Payment
from payments.services import invoice_order


class Command(BaseCommand):
    help = ("Invoices the orders paid with Mercado Pago that have no invoice yet (the webhook "
            "invoices them; this catches the ones it couldn't). For a cron.")

    def handle(self, *args, **options):
        orders = Order.objects.filter(
            status__in=Order.PAID_STATUSES, invoices__isnull=True,
            payments__status=Payment.Status.APPROVED,
        ).distinct()
        for order in orders:
            invoice = invoice_order(order.pk)
            if invoice:
                self.stdout.write(f"{order.number}: {invoice.get_status_display()}")
        self.stdout.write(self.style.SUCCESS("Done."))
