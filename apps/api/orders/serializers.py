from rest_framework import serializers
from .models import Order, OrderItem
from store.models import Product


class ProductSummarySerializer(serializers.Serializer):
    id = serializers.ReadOnlyField()
    slug = serializers.ReadOnlyField()
    name = serializers.ReadOnlyField()


class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.ReadOnlyField()
    product_detail = ProductSummarySerializer(read_only=True, source='product')
    product = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(status=Product.Status.ACTIVE))

    class Meta:
        model = OrderItem
        exclude = ['order']
        read_only_fields = ['unit_price']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(read_only=True, many=True)
    total = serializers.ReadOnlyField()
    customer_detail = serializers.SlugRelatedField(
        source='customer', read_only=True, slug_field='username')

    class Meta:
        model = Order
        fields = serializers.ALL_FIELDS


class OrderCreateSerializer(OrderSerializer):
    items = OrderItemSerializer(many=True)

    def create(self, validated_data):
        return Order.objects.create_with_items(**validated_data)
