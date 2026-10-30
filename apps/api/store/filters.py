import django_filters
from config.filters import OperatorFilterSet
from .models import Product, Category, Brand, VatRate
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
    vat_rate = django_filters.TypedMultipleChoiceFilter(choices=VatRate.choices, coerce=int)
    vat_rate__not = django_filters.TypedMultipleChoiceFilter(field_name="vat_rate", choices=VatRate.choices, coerce=int, exclude=True)

    class Meta:
        model = Product
        fields = []


class ProductOrdering(OrderingFilter):
    """The view's `ordering_fields`, validated by DRF, with the ones that aren't a column mapped to
    what orders them. The pk last, so equal values (e.g. the same price) don't change places
    between pages."""

    lookups = {
        'category': 'category__name',
        'brand': 'brand__name',
        # Annotated by ProductViewSet.get_queryset.
        'active_price': 'final_price',
    }

    def get_ordering(self, request, queryset, view):
        ordering = super().get_ordering(request, queryset, view)
        if not ordering:
            return ordering
        fields = []
        for field in ordering:
            descending = field.startswith('-')
            name = field.removeprefix('-')
            fields.append(('-' if descending else '') + self.lookups.get(name, name))
        return [*fields, 'pk']
