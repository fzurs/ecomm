import logging
from datetime import timedelta
from decimal import Decimal

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.core.mail import EmailMessage
from django.db import transaction
from django.db.models import Max
from django.template.loader import render_to_string
from django.test.utils import override_settings
from django.utils import timezone

from billing import services as billing
from billing.arca import issuer_cuit
from billing.models import Invoice
from billing.pdf import invoice_pdf
from billing.rules import InvoicingError
from billing.sample import SAMPLE_POINT_OF_SALE, SampleWSFE
from orders.models import Order

from . import gateway
from .models import Payment

logger = logging.getLogger("billing")


class PaymentError(Exception):
    """An order that can't be paid now, with a message for the customer."""


def start_payment(order: Order) -> str:
    """A Mercado Pago checkout for a pending order: the URL to pay it."""
    if order.status != Order.Status.PENDING:
        raise PaymentError("This order can't be paid: it isn't waiting for a payment.")
    if order.payments.filter(status__in=Payment.IN_PROGRESS).exists():
        raise PaymentError("There's a payment of this order in process already.")
    preference_id, url = gateway.create_preference(order)
    Payment.objects.create(order=order, preference_id=preference_id, amount=order.total)
    return url


def handle_notification(payment_id: str) -> Payment | None:
    """A notification of Mercado Pago about a payment. Its body proves nothing: the payment is
    read from Mercado Pago with our token. Approved, for the order's total, it pays the order and
    then invoices it. Mercado Pago repeats notifications: the same one again changes nothing."""
    data = gateway.get_payment(payment_id)
    if data is None:
        logger.warning("Mercado Pago notified an unknown payment %s", payment_id)
        return None

    with transaction.atomic():
        order = Order.objects.select_for_update().filter(number=data.get("external_reference")).first()
        if order is None:
            logger.warning("Mercado Pago payment %s of an unknown order %r",
                           payment_id, data.get("external_reference"))
            return None

        provider_id = str(data["id"])
        payment = (
            Payment.objects.filter(provider_payment_id=provider_id).first()
            # The first payment of a link fills the row created with it.
            or order.payments.filter(provider_payment_id=None, status=Payment.Status.CREATED).first()
            or Payment(order=order)
        )
        payment.provider_payment_id = provider_id
        payment.status = data["status"]
        payment.status_detail = data.get("status_detail") or ""
        payment.amount = Decimal(str(data.get("transaction_amount") or 0))
        payment.raw = data
        payment.save()

        if payment.status == Payment.Status.APPROVED and order.status in (
                Order.Status.PENDING, Order.Status.CANCELLED):
            if data.get("currency_id") != "ARS" or payment.amount != Decimal(order.total):
                logger.critical(
                    "Mercado Pago payment %s of order %s doesn't match it: %s %s for a total of %s",
                    provider_id, order.number, data.get("currency_id"), payment.amount, order.total)
                return payment
            if order.status == Order.Status.CANCELLED:
                # E.g. paid in cash after it was cancelled: the money is in, the order goes on.
                logger.warning("Order %s was cancelled and got paid: it's paid again", order.number)
            order.status = Order.Status.PAID
            order.save(update_fields=["status", "updated_at"])
            logger.info("Order %s paid with Mercado Pago payment %s", order.number, provider_id)
            transaction.on_commit(lambda: after_payment(order.pk))
        elif payment.status in (Payment.Status.REFUNDED, Payment.Status.CHARGED_BACK):
            logger.warning("Mercado Pago payment %s of order %s was %s: review it (credit note?)",
                           provider_id, order.number, payment.status)
    return payment


def after_payment(order_id: int):
    """Invoices the paid order and tells the customer. A failure here (ARCA, the mail) doesn't
    undo the payment: the invoice stays rejected or unverified for the admin, and
    `invoice_paid_orders` tries the ones left without one."""
    try:
        invoice = invoice_order(order_id)
    except Exception:
        logger.exception("Couldn't invoice paid order #%s", order_id)
        invoice = None
    try:
        send_payment_received_email(Order.objects.get(pk=order_id), invoice)
    except Exception:
        logger.exception("Couldn't send the payment mail of order #%s", order_id)


def invoice_order(order_id: int) -> Invoice | None:
    """The invoice of a paid order, as AUTO_INVOICE says: `arca`, `sample` (dev: made-up
    vouchers on SAMPLE_POINT_OF_SALE, never ARCA) or `off`. None if it has one already."""
    if settings.AUTO_INVOICE == "off":
        return None
    with transaction.atomic():
        # Locked: the webhook and invoice_paid_orders could invoice it at the same time.
        order = Order.objects.select_for_update().get(pk=order_id)
        if order.status not in Order.PAID_STATUSES or order.invoices.filter(associated_invoice=None).exists():
            return None
        if settings.AUTO_INVOICE == "sample":
            with override_settings(ARCA_POINT_OF_SALE=SAMPLE_POINT_OF_SALE):
                return billing.create_invoice(order, sample_wsfe())
        return billing.create_invoice(order)


def sample_wsfe() -> SampleWSFE:
    """A SampleWSFE that numbers after the sample vouchers already in the database."""
    try:
        wsfe = SampleWSFE(cuit=issuer_cuit())
    except ImproperlyConfigured:
        wsfe = SampleWSFE()
    last = (Invoice.objects.filter(point_of_sale=SAMPLE_POINT_OF_SALE)
            .values_list("voucher_type").annotate(last=Max("number")))
    for voucher_type, number in last:
        wsfe.numbers[voucher_type] = number or 0
    return wsfe


def send_payment_received_email(order: Order, invoice: Invoice | None):
    context = {
        "order": order,
        "store_name": settings.STORE_NAME,
        "order_url": f"{settings.STORE_URL}/orders/{order.number}",
        "invoiced": bool(invoice and invoice.status == Invoice.Status.AUTHORIZED),
    }
    message = EmailMessage(
        f"{settings.ACCOUNT_EMAIL_SUBJECT_PREFIX}Payment received for order {order.number}",
        render_to_string("payments/payment_received.txt", context),
        to=[order.customer.email],
    )
    if context["invoiced"]:
        try:
            message.attach(f"{invoice.letter}-{invoice.point_of_sale:05d}-{invoice.number:08d}.pdf",
                           invoice_pdf(invoice), "application/pdf")
        except (InvoicingError, ImproperlyConfigured):
            # Without the issuer's data (ARCA_ISSUER_*) there's no PDF: the mail goes without it.
            logger.warning("Order %s's invoice went without its PDF", order.number, exc_info=True)
    message.send()


def cancel_unpaid_orders(now=None) -> list[str]:
    """Cancels the store's orders (the ones with a payment link) waiting for a payment longer
    than UNPAID_ORDER_HOURS, unless one is in process (cash, until it's paid). Their link expires
    at the same time. The orders the admin creates by hand are left alone."""
    limit = (now or timezone.now()) - timedelta(hours=settings.UNPAID_ORDER_HOURS)
    cancelled = []
    for order in Order.objects.filter(status=Order.Status.PENDING, created_at__lt=limit,
                                      payments__isnull=False).distinct():
        with transaction.atomic():
            order = Order.objects.select_for_update().get(pk=order.pk)
            if order.status != Order.Status.PENDING or order.payments.filter(
                    status__in=[*Payment.IN_PROGRESS, Payment.Status.APPROVED]).exists():
                continue
            order.status = Order.Status.CANCELLED
            order.save(update_fields=["status", "updated_at"])
            cancelled.append(order.number)
    return cancelled
