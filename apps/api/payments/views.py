import logging

from drf_spectacular.utils import extend_schema
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from config.permissions import StoreEnabled

from . import gateway, services

logger = logging.getLogger("billing")


class MercadoPagoWebhookView(APIView):
    """Mercado Pago's notifications. No session nor CSRF (Mercado Pago calls it, server to
    server): its signature, and reading the payment back from Mercado Pago, are what count."""

    authentication_classes = []
    permission_classes = [StoreEnabled, permissions.AllowAny]

    @extend_schema(exclude=True)
    def post(self, request):
        # Webhooks send `?data.id=...&type=payment`, and the same in the body; the older IPN,
        # `?topic=payment&id=...`.
        body = request.data if isinstance(request.data, dict) else {}
        kind = request.query_params.get("type") or request.query_params.get("topic") or body.get("type")
        data_id = (request.query_params.get("data.id") or request.query_params.get("id")
                   or str((body.get("data") or {}).get("id") or ""))

        if not gateway.valid_signature(request.headers.get("x-signature", ""),
                                       request.headers.get("x-request-id", ""), data_id):
            logger.warning("Mercado Pago notification with a wrong signature (payment %s)", data_id)
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        if kind != "payment" or not data_id:
            # Others (merchant orders, refunds' own topics...) aren't needed: OK, so it stops.
            return Response(status=status.HTTP_200_OK)

        try:
            services.handle_notification(data_id)
        except gateway.GatewayError:
            # Mercado Pago retries what doesn't get a 2xx: it'll be read again later.
            logger.exception("Couldn't read Mercado Pago payment %s", data_id)
            return Response(status=status.HTTP_503_SERVICE_UNAVAILABLE)
        return Response(status=status.HTTP_200_OK)
