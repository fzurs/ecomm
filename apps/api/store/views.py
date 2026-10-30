from django.db.models import Case, F, IntegerField, When
from rest_framework import viewsets, filters
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from config.viewsets import ChoicesMixin, PublicReadMixin, choices_schema
from .models import Product, Category, Brand
from .serializers import BrandChoiceSerializer, CategoryChoiceSerializer, ProductChoiceSerializer, ProductSerializer, CategorySerializer, BrandSerializer
from .filters import ProductFilter, ProductOrdering


@choices_schema("products_list_choices", ProductChoiceSerializer)
class ProductViewSet(PublicReadMixin, ChoicesMixin, viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    choices_serializer_class = ProductChoiceSerializer
    filter_backends = [filters.SearchFilter,
                       DjangoFilterBackend, ProductOrdering]
    filterset_class = ProductFilter
    search_fields = ["name", "sku", "description", "category__name", "brand__name"]
    # Category and Brand are ordered by {model}__name, and active_price by final_price, in
    # ProductOrdering
    ordering_fields = ["name", "category", "brand", "status", "featured", "price", "active_price",
                       "discount_percent", "vat_rate", "created_at"]
    lookup_field = "slug"

    def get_queryset(self):
        # `active_price` in the database, to order by it (the model's property can't).
        discounted = (F("price") * (100 - F("discount_percent")) + 50) / 100
        queryset = super().get_queryset().annotate(final_price=Case(
            When(discount_percent__isnull=False, price__gt=0, then=discounted),
            default=F("price"),
            output_field=IntegerField(),
        ))
        # The store reads without a session: it sees only what's for sale.
        if not self.request.user.is_staff:
            queryset = queryset.filter(status__in=Product.PUBLIC_STATUSES)
        return queryset

    @action(detail=True, methods=['post'], url_path='generate-sku')
    def generate_sku(self, request, **kwargs):
        instance = self.get_object()
        instance.generate_sku()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


@choices_schema("categories_list_choices", CategoryChoiceSerializer)
class CategoryViewSet(PublicReadMixin, ChoicesMixin, viewsets.ModelViewSet):
    queryset = Category.objects.order_by("name")
    serializer_class = CategorySerializer
    choices_serializer_class = CategoryChoiceSerializer
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    ordering_fields = ['name']
    search_fields = ["name"]
    lookup_field = "slug"


@choices_schema("brands_list_choices", BrandChoiceSerializer)
class BrandViewSet(PublicReadMixin, ChoicesMixin, viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    choices_serializer_class = BrandChoiceSerializer
    lookup_field = "slug"
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    ordering_fields = ['name']
    search_fields = ['name']
