import django_filters
from .models import Product, Category, Brand
from rest_framework.filters import OrderingFilter


class ProductFilter(django_filters.FilterSet):
    brand = django_filters.ModelMultipleChoiceFilter(field_name="brand__slug", to_field_name="slug", queryset=Brand.objects.all())
    category = django_filters.ModelMultipleChoiceFilter(field_name="category__slug", to_field_name="slug", queryset=Category.objects.all())
    status = django_filters.MultipleChoiceFilter(choices=Product.STATUS_CHOICES)
    price = django_filters.RangeFilter()
    discount_price = django_filters.RangeFilter()


    class Meta:
        model = Product
        fields = ["featured"]


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