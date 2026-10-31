from django.conf import settings
from drf_spectacular.utils import extend_schema
from rest_framework import filters, permissions, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ShippingZone
from .serializers import ShippingOptionsSerializer, ShippingZoneSerializer


class ShippingZoneViewSet(viewsets.ModelViewSet):
    queryset = ShippingZone.objects.all()
    serializer_class = ShippingZoneSerializer
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    ordering_fields = ["name", "cost", "free_from"]
    search_fields = ["name"]


class ShippingOptionsView(APIView):
    """The store's shipping options, public: the checkout and the shipping page show them."""

    permission_classes = [permissions.AllowAny]

    @extend_schema(operation_id="shipping_options_retrieve", responses=ShippingOptionsSerializer)
    def get(self, request):
        return Response(ShippingOptionsSerializer({
            "zones": ShippingZone.objects.all(),
            "pickup_address": settings.STORE_PICKUP_ADDRESS or None,
        }).data)
