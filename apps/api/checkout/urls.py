from django.urls import path
from rest_framework import routers

from .views import CartItemView, CartItemsView, CartView, CheckoutView, MyOrderViewSet

router = routers.DefaultRouter()
router.register(r"my/orders", MyOrderViewSet, basename="my-order")

urlpatterns = [
    path("cart/", CartView.as_view(), name="cart"),
    path("cart/items/", CartItemsView.as_view(), name="cart-items"),
    path("cart/items/<int:product>/", CartItemView.as_view(), name="cart-item"),
    path("checkout/", CheckoutView.as_view(), name="checkout"),
    *router.urls,
]
