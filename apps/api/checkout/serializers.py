from rest_framework import serializers

from orders.models import Customer, Order, OrderItem
from orders.serializers import CustomerSerializer
from store.models import Product

from .models import MAX_QUANTITY
from .services import is_purchasable


class CartProductSerializer(serializers.ModelSerializer):
    active_price = serializers.IntegerField(read_only=True, allow_null=True)

    class Meta:
        model = Product
        fields = ["id", "slug", "name", "image", "status", "price", "discount_percent", "active_price"]


class CartItemSerializer(serializers.Serializer):
    product = CartProductSerializer()
    quantity = serializers.IntegerField()
    # False when the product can't be bought anymore (out of stock, no longer for sale): it
    # doesn't count in the total, and the checkout asks to take it out.
    available = serializers.BooleanField()
    subtotal = serializers.IntegerField(allow_null=True)


class CartSerializer(serializers.Serializer):
    items = CartItemSerializer(many=True)
    # Units of the available items, for the header's badge.
    count = serializers.IntegerField()
    total = serializers.IntegerField()

    @staticmethod
    def data_for(cart):
        """The cart as the serializer reads it; an empty one without a cart."""
        items = []
        for item in (cart.items.select_related("product") if cart else []):
            available = is_purchasable(item.product)
            items.append({
                "product": item.product,
                "quantity": item.quantity,
                "available": available,
                "subtotal": item.product.active_price * item.quantity if available else None,
            })
        available = [item for item in items if item["available"]]
        return {
            "items": items,
            "count": sum(item["quantity"] for item in available),
            "total": sum(item["subtotal"] for item in available),
        }


class CartItemCreateSerializer(serializers.Serializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    quantity = serializers.IntegerField(min_value=1, max_value=MAX_QUANTITY, default=1)

    def validate_product(self, product):
        if not is_purchasable(product):
            raise serializers.ValidationError("This product can't be bought right now.")
        return product


class CartItemUpdateSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1, max_value=MAX_QUANTITY)


class CheckoutSerializer(CustomerSerializer):
    """Who buys (a Customer, validated like the admin's: CUIT, VAT condition) and where it goes."""

    shipping_address = serializers.CharField(max_length=500)

    class Meta(CustomerSerializer.Meta):
        fields = ["name", "email", "phone", "document_type", "document_number", "vat_condition",
                  "legal_name", "shipping_address"]
        extra_kwargs = {"email": {"required": True, "allow_blank": False}}


class CheckoutResultSerializer(serializers.Serializer):
    number = serializers.CharField()


class MyOrderItemSerializer(serializers.ModelSerializer):
    product = CartProductSerializer()
    subtotal = serializers.IntegerField()

    class Meta:
        model = OrderItem
        fields = ["product", "quantity", "unit_price", "subtotal"]


class MyOrderCustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ["name", "email"]


class MyOrderSerializer(serializers.ModelSerializer):
    """An order as its customer sees it: no invoice internals nor billing data."""

    items = MyOrderItemSerializer(many=True)
    total = serializers.IntegerField()
    customer = MyOrderCustomerSerializer()

    class Meta:
        model = Order
        fields = ["number", "status", "created_at", "customer", "shipping_address", "items", "total"]
