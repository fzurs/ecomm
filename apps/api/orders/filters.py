import django_filters
from django.db.models import Q
from rest_framework.filters import OrderingFilter
from billing.models import ORDER_INVOICE_STATUSES
from config.filters import OperatorFilterSet
from .models import Customer, Order

INVOICE_STATUS_FILTER_CHOICES = [("to_invoice", "To invoice"), *ORDER_INVOICE_STATUSES]


class OrderFilter(OperatorFilterSet):
    # total is the items_total that OrderViewSet annotates.
    operators = {
        "total": ("number", "items_total"),
        "created_at": "date",
    }

    # Option filters: the bare name is "any of", `__not` is "none of".
    status = django_filters.MultipleChoiceFilter(choices=Order.Status.choices)
    status__not = django_filters.MultipleChoiceFilter(field_name="status", choices=Order.Status.choices, exclude=True)
    customer = django_filters.ModelMultipleChoiceFilter(queryset=Customer.objects.all())
    customer__not = django_filters.ModelMultipleChoiceFilter(field_name="customer", queryset=Customer.objects.all(), exclude=True)
    # The invoice_status that OrderViewSet annotates, plus to_invoice: paid and not invoiced.
    invoice_status = django_filters.MultipleChoiceFilter(choices=INVOICE_STATUS_FILTER_CHOICES, method="filter_invoice_status")
    invoice_status__not = django_filters.MultipleChoiceFilter(choices=INVOICE_STATUS_FILTER_CHOICES, method="filter_invoice_status", exclude=True)

    class Meta:
        model = Order
        fields = []

    def filter_invoice_status(self, queryset, name, values):
        if not values:
            return queryset
        q = Q()
        for value in values:
            if value == "to_invoice":
                q |= Q(status=Order.Status.PAID, invoice_status="not_invoiced")
            else:
                q |= Q(invoice_status=value)
        return queryset.exclude(q) if self.filters[name].exclude else queryset.filter(q)


class OrderOrdering(OrderingFilter):
    # Ordering by customer means by its name, not its id; by total, by the items_total that
    # OrderViewSet annotates. The fields are validated against ordering_fields first.
    mapping = {
        'customer': 'customer__name', '-customer': '-customer__name',
        'total': 'items_total', '-total': '-items_total',
    }

    def get_ordering(self, request, queryset, view):
        ordering = super().get_ordering(request, queryset, view)
        return ordering and [self.mapping.get(field, field) for field in ordering]
