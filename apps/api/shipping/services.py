from django.conf import settings

from orders.models import Order

from .models import ShippingZone


class NoShipping(Exception):
    """The order can't go that way: no zone for the province, or no pickup."""


def zone_for(province: str) -> ShippingZone | None:
    return ShippingZone.objects.filter(provinces__contains=[province]).first()


def quote(method: str, province: str | None, subtotal: int) -> int:
    """What shipping costs for an order of `subtotal`: 0 to pick it up (if the store offers
    it, STORE_PICKUP_ADDRESS) or the province's zone, free from its `free_from`. The store's
    checkout shows the same rule with the zones of `/shipping/`."""
    if method == Order.ShippingMethod.PICKUP:
        if not settings.STORE_PICKUP_ADDRESS:
            raise NoShipping("The store doesn't offer pickup.")
        return 0
    zone = zone_for(province) if province else None
    if zone is None:
        raise NoShipping("We don't ship to that province.")
    if zone.free_from is not None and subtotal >= zone.free_from:
        return 0
    return zone.cost
