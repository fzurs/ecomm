import django_filters
from config.filters import OperatorFilterSet
from .models import Product, Category, Brand
from rest_framework.filters import OrderingFilter


BOOLEAN_CHOICES = [("true", "Yes"), ("false", "No")]


def parse_boolean(value):
    return value == "true"


class ProductFilter(OperatorFilterSet):
    operators = {
        "name": "text",
        "price": "number",
        "discount_percent": "number",
        "created_at": "date",
    }

    # Option filters: the bare name is "any of", `__not` is "none of".
    brand = django_filters.ModelMultipleChoiceFilter(field_name="brand__slug", to_field_name="slug", queryset=Brand.objects.all())
    brand__not = django_filters.ModelMultipleChoiceFilter(field_name="brand__slug", to_field_name="slug", queryset=Brand.objects.all(), exclude=True)
    category = django_filters.ModelMultipleChoiceFilter(field_name="category__slug", to_field_name="slug", queryset=Category.objects.all())
    category__not = django_filters.ModelMultipleChoiceFilter(field_name="category__slug", to_field_name="slug", queryset=Category.objects.all(), exclude=True)
    status = django_filters.MultipleChoiceFilter(choices=Product.Status.choices)
    status__not = django_filters.MultipleChoiceFilter(field_name="status", choices=Product.Status.choices, exclude=True)
    featured = django_filters.TypedMultipleChoiceFilter(choices=BOOLEAN_CHOICES, coerce=parse_boolean)
    featured__not = django_filters.TypedMultipleChoiceFilter(field_name="featured", choices=BOOLEAN_CHOICES, coerce=parse_boolean, exclude=True)

    class Meta:
        model = Product
        fields = []


class ProductOrdering(OrderingFilter):
    def get_ordering(self, request, queryset, view):
        params = request.query_params.get(self.ordering_param)
        if params:
            fields = [param.strip() for param in params.split(",")]
            mapping = {
                'category': 'category__name',
                '-category': '-category__name',
                'brand': 'brand__name',
                '-brand': '-brand__name'
            }
            fields = [mapping.get(f, f) for f in fields]
            return fields
        return self.get_default_ordering(view)
