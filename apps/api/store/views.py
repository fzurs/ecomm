from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Product, Category, Brand
from .serializers import ProductSerializer, CategorySerializer, BrandSerializer
from .filters import ProductFilter, ProductOrdering


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.order_by("name")
    serializer_class = ProductSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend, ProductOrdering]
    filterset_class = ProductFilter
    search_fields = ["name", "description", "category__name", "brand__name"]
    ordering_fields = ["name", "category", "brand", "status", "featured", "price", "discount_price", "created_at"]
    lookup_field = "slug"


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.order_by("name")
    serializer_class = CategorySerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["name"]
    pagination_class = None
    lookup_field = "slug"


class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    pagination_class = None
    lookup_field = "slug"