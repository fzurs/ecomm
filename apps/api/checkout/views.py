from django.db.models import Prefetch, Q
from drf_spectacular.utils import extend_schema
from rest_framework import mixins, permissions, serializers, status, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.generics import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from config.authentication import CsrfSessionAuthentication
from config.exceptions import Conflict
from orders.models import Order, OrderItem

from . import services
from .models import CartItem
from .serializers import (
    CartItemCreateSerializer,
    CartItemUpdateSerializer,
    CartSerializer,
    CheckoutResultSerializer,
    CheckoutSerializer,
    MyOrderSerializer,
)


class StoreView(APIView):
    """The store's own endpoints: for guests too, and always with CSRF (their session holds the
    cart). The store calls them from its server, with the visitor's cookies (djangoFetch)."""

    authentication_classes = [CsrfSessionAuthentication]
    permission_classes = [permissions.AllowAny]

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
        serializer = CartItemUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        cart, item = self.get_item(request, product)
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
        shipping_address = customer_data.pop("shipping_address")

        cart = services.get_cart(request)
        try:
            order = services.place_order(request, cart, customer_data, shipping_address)
        except services.EmptyCart:
            raise ValidationError({"detail": "Your cart is empty."})
        except services.UnavailableProducts as exc:
            raise Conflict(f"These products can't be bought anymore: {', '.join(exc.names)}.")
        return Response({"number": order.number}, status=status.HTTP_201_CREATED)


@extend_schema(responses=MyOrderSerializer)
class MyOrderViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    """The visitor's orders: their account's, and the ones a guest placed in this session."""

    authentication_classes = [CsrfSessionAuthentication]
    permission_classes = [permissions.AllowAny]
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
            .prefetch_related(Prefetch("items", OrderItem.objects.select_related("product")))
            .order_by("-created_at")
        )
