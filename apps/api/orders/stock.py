"""The products' stock: an order takes its units when it's placed and gives them back when it's
cancelled. `Order.stock_reserved` says whether it holds them, so neither happens twice."""
import logging
from collections import Counter

from django.db import transaction
from django.db.models import F

from store.models import Product

from .models import Order

logger = logging.getLogger("billing")


class OutOfStock(Exception):
    """Not enough units of these products (their names)."""

    def __init__(self, names):
        super().__init__(names)
        self.names = names


def _quantities(order: Order) -> Counter:
    quantities = Counter()
    for product_id, quantity in order.items.values_list("product_id", "quantity"):
        quantities[product_id] += quantity
    return quantities


def _lock(product_ids) -> dict[int, Product]:
    # Always in the same order, so two orders taking the same products don't deadlock.
    return {product.pk: product
            for product in Product.objects.select_for_update().filter(pk__in=product_ids).order_by("pk")}


@transaction.atomic
def reserve(order: Order, force=False) -> None:
    """Takes the order's units. Without enough, OutOfStock and nothing changes. With `force`
    (an order that got paid: the money is in) it takes what there is and logs the shortage."""
    if order.stock_reserved:
        return
    quantities = _quantities(order)
    products = _lock(quantities)
    short = [products[pk] for pk, quantity in quantities.items() if products[pk].stock < quantity]
    if short and not force:
        raise OutOfStock([product.name for product in short])
    for pk, quantity in quantities.items():
        taken = min(quantity, products[pk].stock)
        Product.objects.filter(pk=pk).update(stock=F("stock") - taken)
    if short:
        logger.critical("Order %s got paid without stock of %s: review it", order.number,
                        ", ".join(product.name for product in short))
    order.stock_reserved = True
    order.save(update_fields=["stock_reserved"])


@transaction.atomic
def release(order: Order, restock=True) -> None:
    """Gives the order's units back, if it took them. Without `restock` (they left and didn't
    come back, e.g. a chargeback of a delivered order) the order just stops holding them."""
    if not order.stock_reserved:
        return
    if restock:
        quantities = _quantities(order)
        _lock(quantities)
        for pk, quantity in quantities.items():
            Product.objects.filter(pk=pk).update(stock=F("stock") + quantity)
    order.stock_reserved = False
    order.save(update_fields=["stock_reserved"])

