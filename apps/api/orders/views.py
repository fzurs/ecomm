from rest_framework import viewsets
from rest_framework.filters import OrderingFilter, SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from config.viewsets import ChoicesMixin, choices_schema
from .filters import OrderFilter
from .models import Order, Customer
from .serializers import OrderSerializer, OrderCreateSerializer, CustomerChoiceSerializer, CustomerSerializer


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.order_by("-created_at")
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_class = OrderFilter
    # Customer are ordered by customer__name in OrderFilter
    ordering_fields = ['status', 'total', 'customer', 'updated_at', 'created_at']
    search_fields = ['customer__name', 'customer__email']
    lookup_field = "number"

    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderSerializer


# Not PublicReadMixin: customers hold personal data, so every action needs a session.
@choices_schema("customers_list_choices", CustomerChoiceSerializer)
class CustomerViewSet(ChoicesMixin, viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    choices_serializer_class = CustomerChoiceSerializer
    filter_backends = [OrderingFilter, SearchFilter]
    ordering_fields = ['name', 'email']
    search_fields = ['name', 'email']
