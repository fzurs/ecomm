import django_filters
from rest_framework.filters import OrderingFilter
from config.filters import OperatorFilterSet
from .models import Customer, Order


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

    class Meta:
        model = Order
        fields = []


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
