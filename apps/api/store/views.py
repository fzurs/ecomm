from rest_framework import viewsets, filters, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from .models import Product, Category, Brand
from .serializers import BrandChoiceSerializer, CategoryChoiceSerializer, ProductChoiceSerializer, ProductSerializer, CategorySerializer, BrandSerializer
from .filters import ProductFilter, ProductOrdering
from drf_spectacular.utils import extend_schema, extend_schema_view


# Lets anyone run `public_actions` (the store reads them); the rest use the default permissions.
# A comment, not a docstring: drf-spectacular would inherit it as every endpoint's description.
class PublicReadMixin:
    public_actions = ["list", "retrieve", "choices"]

    def get_permissions(self):
        if self.action in self.public_actions:
            return [permissions.AllowAny()]
        return super().get_permissions()


# Adds `choices`: the filtered queryset, unpaginated, with `choices_serializer_class` (feeds the
# admin selects). Each viewset documents it with `choices_schema`, to keep its operation_id.
class ChoicesMixin:
    choices_serializer_class = None

    def get_serializer_class(self):
        if self.action == "choices":
            return self.choices_serializer_class
        return super().get_serializer_class()

    @action(detail=False, methods=["get"], pagination_class=None)
    def choices(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


def choices_schema(operation_id, serializer_class):
    return extend_schema_view(
        choices=extend_schema(operation_id=operation_id, responses=serializer_class(many=True)))


@choices_schema("products_list_choices", ProductChoiceSerializer)
class ProductViewSet(PublicReadMixin, ChoicesMixin, viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    choices_serializer_class = ProductChoiceSerializer
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
