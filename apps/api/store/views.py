from rest_framework import viewsets, filters
from .serializers import (
    CustomerSerializer,
    CategorySerializer,
    BrandSerializer,
    ProductSerializer,
    OrderSerializer,
)
from .models import Customer, Category, Brand, Product, Order


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["user__username", "user__email", "user__full_name"]


class BrandViewSet(viewsets.ModelViewSet):
    queryset = Brand.objects.all()
    serializer_class = BrandSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "website"]


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["name"]


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["name", "description", "category__name", "status"]
    ordering_fields = [
        "name",
        "created_at",
        "updated_at",
        "price",
        "stock_quantity",
        "status",
    ]


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
