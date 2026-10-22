from rest_framework import viewsets, filters, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from .models import Product, Category, Brand
from .serializers import BrandChoiceSerializer, CategoryChoiceSerializer, ProductChoiceSerializer, ProductSerializer, CategorySerializer, BrandSerializer
from .filters import ProductFilter, ProductOrdering
from drf_spectacular.utils import extend_schema


# Lets anyone run `public_actions` (the store reads them); the rest use the default permissions.
# A comment, not a docstring: drf-spectacular would inherit it as every endpoint's description.
class PublicReadMixin:
    public_actions = ["list", "retrieve", "choices"]

    def get_permissions(self):
        if self.action in self.public_actions:
            return [permissions.AllowAny()]
        return super().get_permissions()


class ProductViewSet(PublicReadMixin, viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [filters.SearchFilter,
                       DjangoFilterBackend, ProductOrdering]
    filterset_class = ProductFilter
    search_fields = ["name", "description", "category__name", "brand__name"]
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

    def get_serializer_class(self):
        if self.action == "choices":
            return ProductChoiceSerializer
        return super().get_serializer_class()

    @extend_schema(operation_id="products_list_choices", responses=ProductChoiceSerializer(many=True))
    @action(detail=False, methods=["get"], pagination_class=None)
    def choices(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class CategoryViewSet(PublicReadMixin, viewsets.ModelViewSet):
    queryset = Category.objects.order_by("name")
    serializer_class = CategorySerializer
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    ordering_fields = ['name']
    search_fields = ["name"]
    lookup_field = "slug"

    def get_serializer_class(self):
        if self.action == "choices":
            return CategoryChoiceSerializer
        return super().get_serializer_class()

    @extend_schema(operation_id="categories_list_choices", responses=CategoryChoiceSerializer(many=True))
    @action(detail=False, methods=["get"], pagination_class=None)
    def choices(self, request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class BrandViewSet(PublicReadMixin, viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    lookup_field = "slug"
    filter_backends = [filters.OrderingFilter, filters.SearchFilter]
    ordering_fields = ['name']
    search_fields = ['name']

    def get_serializer_class(self):
        if self.action == "choices":
            return BrandChoiceSerializer
        return super().get_serializer_class()

    @extend_schema(operation_id="brands_list_choices", responses=BrandChoiceSerializer(many=True))
    @action(detail=False, methods=["get"], pagination_class=None)
    def choices(self, request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
