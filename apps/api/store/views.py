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
    # Category and Brand are ordered by {model}__name, in ProductFilter
    ordering_fields = ["name", "category", "brand", "status",
                       "featured", "price", "discount_price", "created_at"]
    lookup_field = "slug"

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
