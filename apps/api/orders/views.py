from django.db.models import F, Sum
from django.db.models.functions import Coalesce
from rest_framework import viewsets
from rest_framework.filters import OrderingFilter, SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from config.viewsets import ChoicesMixin, choices_schema
from .filters import OrderFilter, OrderOrdering
from .models import Order, Customer
from .serializers import OrderSerializer, OrderCreateSerializer, CustomerChoiceSerializer, CustomerSerializer


class OrderViewSet(viewsets.ModelViewSet):
    # Order.total is a Python property, so the database can't order by it: items_total is the
    # same sum computed in SQL.
    queryset = Order.objects.annotate(
        items_total=Coalesce(Sum(F("items__unit_price") * F("items__quantity")), 0),
    ).order_by("-created_at")
    filter_backends = [DjangoFilterBackend, OrderOrdering, SearchFilter]
    filterset_class = OrderFilter
    # Customer and total are mapped to customer__name and items_total, in OrderOrdering
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
