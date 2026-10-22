import django_filters
from rest_framework.filters import OrderingFilter
from .models import Order


class OrderFilter(django_filters.FilterSet):
    status = django_filters.MultipleChoiceFilter(choices=Order.Status.choices)

    class Meta:
        model = Order
        fields = ["status"]


class OrderOrdering(OrderingFilter):
    # Ordering by customer means by its name, not its id. The fields are validated against
    # ordering_fields by OrderingFilter first.
    mapping = {'customer': 'customer__name', '-customer': '-customer__name'}

    def get_ordering(self, request, queryset, view):
        ordering = super().get_ordering(request, queryset, view)
        return ordering and [self.mapping.get(field, field) for field in ordering]
