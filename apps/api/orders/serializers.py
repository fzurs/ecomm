from rest_framework import serializers
from .models import Order, OrderItem, Customer
from store.models import Product


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = serializers.ALL_FIELDS


class ProductSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["id", "slug", "name", "price"]


class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.IntegerField(read_only=True)
    product_detail = ProductSummarySerializer(read_only=True, source='product')
    product = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(status=Product.Status.ACTIVE))

    class Meta:
        model = OrderItem
        exclude = ['order']
        read_only_fields = ['unit_price']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(read_only=True, many=True)
    total = serializers.IntegerField(read_only=True)
    customer_detail = CustomerSerializer(source="customer", read_only=True)

    class Meta:
        model = Order
        fields = serializers.ALL_FIELDS


class OrderCreateSerializer(OrderSerializer):
    items = OrderItemSerializer(many=True)

    def create(self, validated_data):
        return Order.objects.create_with_items(**validated_data)
