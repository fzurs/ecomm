import logging

from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.db.models import Prefetch, Q
from django.http import HttpResponse
from drf_spectacular.utils import extend_schema
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from billing.pdf import invoice_pdf
from billing.rules import InvoicingError
from config.authentication import CsrfSessionAuthentication
from config.exceptions import Conflict, ServiceUnavailable
from config.permissions import StoreEnabled
from orders.models import Order, OrderItem
from payments import services as payments
from payments.gateway import GatewayError
from payments.models import Payment
from shipping.services import NoShipping

from . import services
from .models import CartItem
from .serializers import (
    CartItemCreateSerializer,
    CartItemUpdateSerializer,
    CartSerializer,
    CheckoutResultSerializer,
    CheckoutSerializer,
    MyOrderSerializer,
    PaymentLinkSerializer,
    invoice_of,
)

logger = logging.getLogger("billing")


class StoreView(APIView):
    """The store's own endpoints: for guests too, and always with CSRF (their session holds the
    cart). The store calls them from its server, with the visitor's cookies (djangoFetch)."""

    authentication_classes = [CsrfSessionAuthentication]
    permission_classes = [StoreEnabled, permissions.AllowAny]

    def cart_response(self, cart, status=status.HTTP_200_OK):
        # With the request: the images' URLs are absolute only with it (the store's origin
        # doesn't serve /media/).
        serializer = CartSerializer(CartSerializer.data_for(cart), context={"request": self.request})
        return Response(serializer.data, status=status)


class CartView(StoreView):
    @extend_schema(operation_id="cart_retrieve", responses=CartSerializer)
    def get(self, request):
        return self.cart_response(services.get_cart(request))


class CartItemsView(StoreView):
    @extend_schema(operation_id="cart_items_create", request=CartItemCreateSerializer,
                   responses=CartSerializer)
    def post(self, request):
        serializer = CartItemCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cart = services.get_cart(request, create=True)
        services.add_item(cart, serializer.validated_data["product"], serializer.validated_data["quantity"])
        return self.cart_response(cart)


class CartItemView(StoreView):
    def get_item(self, request, product):
        cart = services.get_cart(request)
        return cart, get_object_or_404(CartItem.objects.filter(cart=cart), product=product)

    @extend_schema(operation_id="cart_items_partial_update", request=CartItemUpdateSerializer,
                   responses=CartSerializer)
    def patch(self, request, product):
        cart, item = self.get_item(request, product)
        serializer = CartItemUpdateSerializer(data=request.data, context={"product": item.product})
        serializer.is_valid(raise_exception=True)
        item.quantity = serializer.validated_data["quantity"]
        item.save(update_fields=["quantity"])
        return self.cart_response(cart)

    @extend_schema(operation_id="cart_items_destroy", responses=CartSerializer)
    def delete(self, request, product):
        cart, item = self.get_item(request, product)
        item.delete()
        return self.cart_response(cart)


class CheckoutView(StoreView):
    @extend_schema(operation_id="checkout_create", request=CheckoutSerializer,
                   responses={201: CheckoutResultSerializer})
    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        customer_data = dict(serializer.validated_data)
        shipping = {field: customer_data.pop(field) for field in CheckoutSerializer.SHIPPING_FIELDS}

        cart = services.get_cart(request)
        try:
            order = services.place_order(request, cart, customer_data, shipping)
        except services.EmptyCart:
            raise ValidationError({"detail": "Your cart is empty."})
        except NoShipping as exc:
            pickup = shipping["shipping_method"] == Order.ShippingMethod.PICKUP
            raise ValidationError({"shipping_method" if pickup else "shipping_province": str(exc)})
        except services.NotEnoughStock as exc:
            raise Conflict(f"There isn't enough stock of: {', '.join(exc.names)}.")
        except services.UnavailableProducts as exc:
            raise Conflict(f"These products can't be bought anymore: {', '.join(exc.names)}.")
        return Response({"number": order.number, "payment_url": payment_link(order)},
                        status=status.HTTP_201_CREATED)


def payment_link(order):
    """Mercado Pago's checkout for the new order, or None if it can't be made now (not
    configured, down): the order is placed anyway, and its page offers to pay it."""
    if not settings.MERCADOPAGO_ACCESS_TOKEN:
        return None
    try:
        return payments.start_payment(order)
    except (payments.PaymentError, GatewayError):
        logger.exception("No payment link for order %s", order.number)
        return None


@extend_schema(responses=MyOrderSerializer)
class MyOrderViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    """The visitor's orders: their account's, and the ones a guest placed in this session."""

    authentication_classes = [CsrfSessionAuthentication]
    permission_classes = [StoreEnabled, permissions.AllowAny]
    serializer_class = MyOrderSerializer
    lookup_field = "number"
    pagination_class = None

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):  # drf-spectacular, without a session
            return Order.objects.none()
        mine = Q(number__in=self.request.session.get(services.PLACED_ORDERS_KEY, []))
        if self.request.user.is_authenticated:
            mine |= Q(customer__user=self.request.user)
        return (
            Order.objects.filter(mine)
            .select_related("customer")
            .prefetch_related(
                Prefetch("items", OrderItem.objects.select_related("product")),
                Prefetch("payments", Payment.objects.order_by("-created_at", "-pk")),
                "invoices",
            )
            .order_by("-created_at")
        )

    @extend_schema(operation_id="my_orders_pay", request=None, responses=PaymentLinkSerializer)
    @action(detail=True, methods=["post"])
    def pay(self, request, number=None):
        """A Mercado Pago checkout for the order: to pay it later, or again after a rejection."""
        order = self.get_object()
        try:
            url = payments.start_payment(order)
        except payments.PaymentError as exc:
            raise Conflict(str(exc))
        except GatewayError:
            logger.exception("No payment link for order %s", order.number)
            raise ServiceUnavailable()
        return Response({"payment_url": url})

    @extend_schema(operation_id="my_orders_invoice", responses={(200, "application/pdf"): bytes})
    @action(detail=True, methods=["get"])
    def invoice(self, request, number=None):
        """The order's invoice, as a PDF."""
        invoice = invoice_of(self.get_object())
        if invoice is None:
            raise NotFound("This order has no invoice yet.")
        try:
            pdf = invoice_pdf(invoice)
        except (InvoicingError, ImproperlyConfigured):
            raise NotFound("This order's invoice can't be downloaded yet.")
        filename = f"{invoice.letter}-{invoice.point_of_sale:05d}-{invoice.number:08d}.pdf"
        return HttpResponse(pdf, content_type="application/pdf",
                            headers={"Content-Disposition": f'attachment; filename="{filename}"'})
