"""Mercado Pago (Checkout Pro), the only module that talks to its SDK: the tests mock it."""
import hashlib
import hmac
from datetime import timedelta
from urllib.parse import urlsplit

import mercadopago
from django.conf import settings
from django.utils import timezone

from orders.models import Order


class GatewayError(Exception):
    """Mercado Pago didn't answer, refused the request, or isn't configured."""


def sdk():
    if not settings.MERCADOPAGO_ACCESS_TOKEN:
        raise GatewayError("Mercado Pago isn't configured (MERCADOPAGO_ACCESS_TOKEN).")
    return mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)


def create_preference(order: Order) -> tuple[str, str]:
    """The checkout of `order` in Mercado Pago: its preference id and the URL to pay it. The
    payment comes back to the order's page, and its notifications to our webhook."""
    order_url = f"{settings.STORE_URL}/orders/{order.number}"
    expires = timezone.now() + timedelta(hours=settings.UNPAID_ORDER_HOURS)
    data = {
        "items": [
            {
                "id": str(item.product_id),
                "title": item.product.name[:256],
                "quantity": item.quantity,
                "unit_price": float(item.unit_price),
                "currency_id": "ARS",
            }
            for item in order.items.select_related("product")
        ],
        # No `payer`: Mercado Pago asks the buyer to log in or give their email anyway, and a
        # checkout's email (a person) with a test seller makes it refuse the payment ("one of the
        # parties is a test one").
        # How a notification finds the order (`services.handle_notification`).
        "external_reference": order.number,
        "back_urls": {"success": order_url, "pending": order_url, "failure": order_url},
        # The link and a cash ticket stop working when the order is cancelled unpaid.
        "expires": True,
        "expiration_date_to": expires.isoformat(timespec="milliseconds"),
        "date_of_expiration": expires.isoformat(timespec="milliseconds"),
    }
    # Back to the store on its own once approved: Mercado Pago only takes it with a public HTTPS
    # store (not dev's localhost, where its page shows a button back instead).
    if urlsplit(settings.STORE_URL).scheme == "https":
        data["auto_return"] = "approved"
    if settings.MERCADOPAGO_STATEMENT_DESCRIPTOR:
        data["statement_descriptor"] = settings.MERCADOPAGO_STATEMENT_DESCRIPTOR
    # Mercado Pago can't reach localhost: in dev, the panel's webhook URL (a tunnel) does.
    if urlsplit(settings.MERCADOPAGO_NOTIFICATION_URL).hostname not in ("localhost", "127.0.0.1"):
        data["notification_url"] = settings.MERCADOPAGO_NOTIFICATION_URL

    result = sdk().preference().create(data)
    if result.get("status") not in (200, 201):
        raise GatewayError(f"Mercado Pago refused the preference: {result.get('response')}")
    preference = result["response"]
    url = preference["sandbox_init_point"] if settings.MERCADOPAGO_SANDBOX else preference["init_point"]
    return preference["id"], url


def get_payment(payment_id: str) -> dict | None:
    """The payment as Mercado Pago has it, or None if it doesn't know it."""
    result = sdk().payment().get(payment_id)
    if result.get("status") == 404:
        return None
    if result.get("status") != 200:
        raise GatewayError(f"Mercado Pago didn't return payment {payment_id}: {result.get('response')}")
    return result["response"]


def valid_signature(signature: str, request_id: str, data_id: str) -> bool:
    """Checks a notification's `x-signature` (`ts=...,v1=...`): the HMAC-SHA256, with the
    webhook's secret, of `id:<data.id>;request-id:<x-request-id>;ts:<ts>;` (what's missing is
    left out). Without a secret configured, it can't be checked."""
    secret = settings.MERCADOPAGO_WEBHOOK_SECRET
    if not secret:
        return True
    parts = dict(part.strip().split("=", 1) for part in signature.split(",") if "=" in part)
    ts, v1 = parts.get("ts"), parts.get("v1")
    if not ts or not v1:
        return False
    manifest = ""
    if data_id:
        manifest += f"id:{data_id.lower() if data_id.isalnum() else data_id};"
    if request_id:
        manifest += f"request-id:{request_id};"
    manifest += f"ts:{ts};"
    expected = hmac.new(secret.encode(), manifest.encode(), hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, v1)
