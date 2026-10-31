from django.urls import path
from rest_framework import routers

from .views import ShippingOptionsView, ShippingZoneViewSet

router = routers.DefaultRouter()
router.register(r"shipping-zones", ShippingZoneViewSet)

urlpatterns = [
    path("shipping/", ShippingOptionsView.as_view(), name="shipping-options"),
    *router.urls,
]
