from django.core.management.base import BaseCommand

from orders.models import Order
from payments.models import Payment
from payments.services import credit_order, invoice_order, restocks

REFUNDS = [Payment.Status.REFUNDED, Payment.Status.CHARGED_BACK]


class Command(BaseCommand):
    help = ("Invoices the orders paid with Mercado Pago that have no invoice yet, and credits the "
            "refunded ones still standing (the webhook does both; this catches the ones it "
            "couldn't). For a cron.")

    def handle(self, *args, **options):
        orders = Order.objects.filter(
            status__in=Order.PAID_STATUSES, invoices__isnull=True,
            payments__status=Payment.Status.APPROVED,
        ).distinct()
        for order in orders:
            invoice = invoice_order(order.pk)
            if invoice:
                self.stdout.write(f"{order.number}: {invoice.get_status_display()}")

        refunded = Order.objects.filter(
            status__in=Order.PAID_STATUSES, payments__status__in=REFUNDS,
        ).exclude(payments__status=Payment.Status.APPROVED).distinct()
        for order in refunded:
            payment = order.payments.filter(status__in=REFUNDS).first()
            note = credit_order(order.pk, restock=restocks(payment.status, order.status))
            order.refresh_from_db()
            self.stdout.write(f"{order.number}: refunded, {order.get_status_display()}"
                              + (f", credit note {note.get_status_display()}" if note else ""))
        self.stdout.write(self.style.SUCCESS("Done."))
