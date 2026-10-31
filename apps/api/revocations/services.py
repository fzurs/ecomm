import logging
from datetime import timedelta

from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction
from django.template.loader import render_to_string
from django.utils import timezone

from orders.models import Order
from payments import services as payments
from payments.models import Payment

from .models import RevocationRequest

logger = logging.getLogger("billing")

# Res. 424/2020 and the Ley de Defensa del Consumidor (art. 34): calendar days.
REVOCATION_DAYS = 10


class RevocationError(Exception):
    """It can't be done, with a message for whoever asked."""


def deadline(order: Order):
    """Until when the purchase can be revoked: 10 days from the purchase or the delivery,
    whichever is later. None while it isn't delivered: the time hasn't started."""
    if order.delivered_at is None:
        return None
    return max(order.created_at, order.delivered_at) + timedelta(days=REVOCATION_DAYS)


def request_revocation(number: str, email: str, reason: str = "") -> RevocationRequest:
    """The customer's request. The order and the email have to match: whoever doesn't know both
    gets the same answer as for an order that doesn't exist."""
    order = Order.objects.select_related("customer").filter(number=number.strip().upper()).first()
    if order is None or order.customer.email.lower() != email.strip().lower():
        raise RevocationError("We couldn't find an order with that number and email.")
    if order.status == Order.Status.CANCELLED:
        raise RevocationError("This order is cancelled already.")
    if order.status not in Order.PAID_STATUSES:
        raise RevocationError(
            "This order isn't paid: if you don't pay it, it's cancelled on its own.")
    limit = deadline(order)
    if limit is not None and timezone.now() > limit:
        raise RevocationError(
            f"The {REVOCATION_DAYS} days to revoke this purchase ended on "
            f"{timezone.localdate(limit):%d/%m/%Y}.")
    open_request = order.revocations.filter(status=RevocationRequest.Status.REQUESTED).first()
    if open_request is not None:
        raise RevocationError(f"There's a request for this order already: {open_request.code}.")

    revocation = RevocationRequest.objects.create(order=order, email=email.strip(), reason=reason)
    logger.info("Revocation %s of order %s requested", revocation.code, order.number)
    transaction.on_commit(lambda: send_requested_emails(revocation))
    return revocation


def approve(revocation: RevocationRequest, user, goods_returned=False, note="") -> RevocationRequest:
    """Gives the money back (Mercado Pago's refund, or by hand for an order without one) and
    credits the invoice, cancelling the order (`payments.credit_order`). A shipped order needs
    its goods back first."""
    with transaction.atomic():
        revocation = RevocationRequest.objects.select_for_update().select_related("order").get(pk=revocation.pk)
        if revocation.status != RevocationRequest.Status.REQUESTED:
            raise RevocationError("This request was resolved already.")
        order = revocation.order
        if order.status in (Order.Status.SHIPPED, Order.Status.DELIVERED) and not goods_returned:
            raise RevocationError("The order was shipped: approve it once its goods are back.")

        paid_with_mercadopago = order.payments.filter(status=Payment.Status.APPROVED).exists()
        if paid_with_mercadopago:
            # GatewayError if Mercado Pago refuses it: nothing changes here.
            payments.refund_order(order)
        revocation.status = RevocationRequest.Status.APPROVED
        revocation.refund = (RevocationRequest.Refund.MERCADOPAGO if paid_with_mercadopago
                             else RevocationRequest.Refund.MANUAL)
        revocation.resolution_note = note
        revocation.resolved_by = user
        revocation.resolved_at = timezone.now()
        revocation.save()
    logger.info("Revocation %s approved (%s refund)", revocation.code, revocation.refund)
    # Like the `refunded` notification would: whichever comes first credits it.
    payments.credit_order(order.pk)
    send_resolved_email(revocation)
    return revocation


def reject(revocation: RevocationRequest, user, note: str) -> RevocationRequest:
    with transaction.atomic():
        revocation = RevocationRequest.objects.select_for_update().get(pk=revocation.pk)
        if revocation.status != RevocationRequest.Status.REQUESTED:
            raise RevocationError("This request was resolved already.")
        revocation.status = RevocationRequest.Status.REJECTED
        revocation.resolution_note = note
        revocation.resolved_by = user
        revocation.resolved_at = timezone.now()
        revocation.save()
    logger.info("Revocation %s rejected", revocation.code)
    send_resolved_email(revocation)
    return revocation


def _context(revocation):
    return {
        "revocation": revocation,
        "order": revocation.order,
        "store_name": settings.STORE_NAME,
        "order_url": f"{settings.STORE_URL}/orders/{revocation.order.number}",
        "days": REVOCATION_DAYS,
    }


def send_requested_emails(revocation: RevocationRequest):
    prefix = settings.ACCOUNT_EMAIL_SUBJECT_PREFIX
    send_mail(
        f"{prefix}We received your request {revocation.code}",
        render_to_string("revocations/requested.txt", _context(revocation)),
        None, [revocation.email],
    )
    if settings.STAFF_NOTIFICATION_EMAIL:
        send_mail(
            f"{prefix}Revocation {revocation.code} of order {revocation.order.number}",
            render_to_string("revocations/requested_staff.txt", _context(revocation)),
            None, [settings.STAFF_NOTIFICATION_EMAIL],
        )


def send_resolved_email(revocation: RevocationRequest):
    try:
        send_mail(
            f"{settings.ACCOUNT_EMAIL_SUBJECT_PREFIX}Your request {revocation.code} was "
            f"{revocation.get_status_display().lower()}",
            render_to_string("revocations/resolved.txt", _context(revocation)),
            None, [revocation.email],
        )
    except Exception:
        # It's resolved anyway: the admin shows it.
        logger.exception("Couldn't send the mail of revocation %s", revocation.code)
