import re
from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from rest_framework.decorators import action
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

    @action(detail=True, methods=["post"])
    def duplicate(self, request, *args, **kwargs):
        product = self.get_object()

        data = ProductSerializer(product).data
        data["name"] = self.get_next_copy_name(product)

        data["category_id"] = product.category.id
        data["brand_id"] = product.brand.id

        del data["sku"]
        del data["slug"]

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data, status=status.HTTP_201_CREATED, headers=headers
        )

    def get_next_copy_name(self, product):
        pattern = re.compile(r"^(.*?)(?: copy(?: \((\d+)\))?)?$")

        match = pattern.match(product.name)
        if match:
            base_name = match.group(1)
        else:
            base_name = product.name

        existing = self.queryset.model.objects.filter(
            **{f"name__startswith": base_name}
        )

        max_counter = 0
        for obj in existing:
            m = pattern.match(getattr(obj, "name"))
            if m and m.group(2):
                max_counter = max(max_counter, int(m.group(2)))
            elif m and not m.group(2) and getattr(obj, "name") == f"{base_name} copy":
                max_counter = max(max_counter, 1)

        if max_counter == 0:
            return f"{base_name} copy"
        else:
            return f"{base_name} copy ({max_counter + 1})"


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
