import django_filters
from .models import Product, Category


class ProductFilter(django_filters.FilterSet):
    category = django_filters.ModelMultipleChoiceFilter(
        field_name="category", queryset=Category.objects.all()
    )
    status = django_filters.MultipleChoiceFilter(field_name="status", choices=Product.STATUS_CHOICES)

    class Meta:
        model = Product
        fields = ["category", "status"]
