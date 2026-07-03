from rest_framework import viewsets, filters, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django_filters.rest_framework import DjangoFilterBackend
from .models import Product, Category, Brand
from .serializers import ProductSerializer, CategorySerializer, BrandSerializer
from .filters import ProductFilter, ProductOrdering
from drf_spectacular.utils import extend_schema


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend, ProductOrdering]
    filterset_class = ProductFilter
    search_fields = ["name", "description", "category__name", "brand__name"]
    ordering_fields = ["name", "category", "brand", "status", "featured", "price", "discount_price", "created_at"]
    lookup_field = "slug"

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [permissions.AllowAny()]
        return super().get_permissions()

    @action(detail=True, methods=['post'], url_path='generate-sku')
    def generate_sku(self, request, **kwargs):
        instance = self.get_object()
        is_success = instance.generate_sku()
        if not is_success: return Response({'message': 'The SKU could not be generated'}, status.HTTP_400_BAD_REQUEST) 
        serializer = self.get_serializer(instance)
        return Response(serializer.data) 

    @action(detail=True, methods=["post"], url_path='detect-and-assign-brand')
    def detect_and_assign_brand(self, request, **kwargs):
        instance = self.get_object()
        is_success = instance.detect_and_assign_brand()
        if not is_success: return Response({'message': 'No brand was detected in the product name'}, status.HTTP_400_BAD_REQUEST)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.order_by("name")
    serializer_class = CategorySerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["name"]
    lookup_field = "slug"

    def get_permissions(self):
        if self.action in ["list", "retrieve", "all"]:
            return [permissions.AllowAny()]
        return super().get_permissions()
    
    @extend_schema(operation_id="categories_list_all", responses=CategorySerializer(many=True))
    @action(detail=False, methods=["get"], pagination_class=None)
    def all(self, request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    lookup_field = "slug"

    def get_permissions(self):
        if self.action in ["list", "retrieve", "all"]:
            return [permissions.AllowAny()]
        return super().get_permissions()

    @extend_schema(operation_id="brands_list_all", responses=BrandSerializer(many=True))
    @action(detail=False, methods=["get"], pagination_class=None)
    def all(self, request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)