import django_filters
from .models import Order


class OrderFilter(django_filters.FilterSet):
    status = django_filters.MultipleChoiceFilter(choices=Order.Status.choices)

    class Meta:
        model = Order
        fields = ["status"]
