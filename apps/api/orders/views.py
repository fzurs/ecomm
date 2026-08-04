from rest_framework import viewsets
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from django_filters.rest_framework import DjangoFilterBackend
from .filters import OrderFilter
from .models import Order, Customer
from .serializers import OrderSerializer, OrderCreateSerializer, CustomerSerializer


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.order_by("-created_at")
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_class = OrderFilter
    # Customer are ordered by customer__name in OrderFilter
    ordering_fields = ['status', 'total', 'customer', 'updated_at', 'created_at']
    search_fields = ['customer__name', 'customer__email']

    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderSerializer


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    filter_backends = [OrderingFilter, SearchFilter]
    ordering_fields = ['name', 'email']
    search_fields = ['name', 'email']

    @extend_schema(operation_id="customers_list_all", responses=CustomerSerializer(many=True))
    @action(detail=False, methods=["get"], pagination_class=None)
    def all(self, request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
