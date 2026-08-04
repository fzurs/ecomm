import django_filters
from .models import Order


class OrderFilter(django_filters.FilterSet):
    status = django_filters.MultipleChoiceFilter(choices=Order.Status.choices)

    def get_ordering(self, request, queryset, view):
        params = request.query_params.get(self.ordering_param) 
        if params:
            fields = [param.strip() for param in params.split(",")]
            mapping = {
                'cusomter': 'cusomter__name',
                '-cusomter': '-cusomter__name',
            }
            fields = [mapping.get(f, f) for f in fields]
            return fields
        return self.get_default_ordering(view)

    class Meta:
        model = Order
        fields = ["status"]
