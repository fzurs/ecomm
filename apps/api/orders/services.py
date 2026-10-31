import logging

from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction
from django.template.loader import render_to_string

from . import stock
from .models import Order

logger = logging.getLogger(__name__)


def set_status(order: Order, status: str, force=False, restock=True) -> None:
    """Changes the order's status with what goes along: a cancelled order gives its stock back
    (unless `restock` is False: the goods didn't come back) and one that leaves `cancelled`
    takes it again (`force`: even without enough, see `stock.reserve`); shipping it tells the
    customer. Call it with the order locked."""
    if status == order.status:
        return
    if status == Order.Status.CANCELLED:
        stock.release(order, restock=restock)
    elif order.status == Order.Status.CANCELLED:
        stock.reserve(order, force=force)
    order.status = status
    order.save(update_fields=["status", "updated_at"])
    if status == Order.Status.SHIPPED:
        transaction.on_commit(lambda: send_order_shipped_email(order.pk))


def send_order_shipped_email(order_id: int):
    order = Order.objects.select_related("customer").get(pk=order_id)
    if not order.customer.email:
        return
    pickup = order.shipping_method == Order.ShippingMethod.PICKUP
    try:
        send_mail(
            f"{settings.ACCOUNT_EMAIL_SUBJECT_PREFIX}Order {order.number} "
            + ("is ready to pick up" if pickup else "is on its way"),
            render_to_string("orders/order_shipped.txt", {
                "order": order,
                "store_name": settings.STORE_NAME,
                "order_url": f"{settings.STORE_URL}/orders/{order.number}",
                "pickup_address": settings.STORE_PICKUP_ADDRESS,
            }),
            None,
            [order.customer.email],
        )
    except Exception:
        # The order shipped anyway.
        logger.exception("Couldn't send the shipping mail of order %s", order.number)
