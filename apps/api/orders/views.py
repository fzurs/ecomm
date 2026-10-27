from django.db.models import F, Sum
from django.db.models.functions import Coalesce
from rest_framework import viewsets
from rest_framework.filters import OrderingFilter, SearchFilter
from django_filters.rest_framework import DjangoFilterBackend
from billing import services as billing
from billing.models import order_invoice_status, order_invoice_uncredited
from billing.rules import order_delete_lock
from config.exceptions import Conflict
from config.viewsets import ChoicesMixin, choices_schema
from .filters import OrderFilter, OrderOrdering
from .models import Order, Customer
from .serializers import OrderSerializer, OrderCreateSerializer, CustomerChoiceSerializer, CustomerSerializer


class OrderViewSet(viewsets.ModelViewSet):
    # Order.total is a Python property, so the database can't order by it: items_total is the
    # same sum computed in SQL. The serializer reads the customer, the items with their product
    # and the total (over the prefetched items) of each order: loading them here keeps the
    # list at a fixed number of queries. invoice_status and
    # invoice_uncredited (for the status locks) are subqueries for the same reason.
    queryset = Order.objects.select_related("customer").prefetch_related(
        "items__product",
    ).annotate(
        items_total=Coalesce(Sum(F("items__unit_price") * F("items__quantity")), 0),
        invoice_status=order_invoice_status(),
        invoice_uncredited=order_invoice_uncredited(),
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

    def perform_destroy(self, instance):
        reason = order_delete_lock(instance)
        if reason:
            raise Conflict(reason)
        billing.delete_order(instance)


# Not PublicReadMixin: customers hold personal data, so every action needs a session.
@choices_schema("customers_list_choices", CustomerChoiceSerializer)
class CustomerViewSet(ChoicesMixin, viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    choices_serializer_class = CustomerChoiceSerializer
    filter_backends = [OrderingFilter, SearchFilter]
    ordering_fields = ['name', 'email']
    search_fields = ['name', 'email']
