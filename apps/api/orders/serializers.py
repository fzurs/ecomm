from arca_client.certificates import is_valid_cuit, normalize_cuit
from arca_client.wsfe import CONDICIONES_A
from rest_framework import serializers
from billing.models import ORDER_INVOICE_STATUSES
from .models import Order, OrderItem, Customer
from store.models import Product


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = serializers.ALL_FIELDS

    def validate(self, attrs):
        attrs = super().validate(attrs)
        get = lambda field: attrs[field] if field in attrs else getattr(self.instance, field, None)
        document_type, number = get("document_type"), get("document_number")
        vat_condition = get("vat_condition") or Customer.VatCondition.FINAL_CONSUMER

        if number:
            number = normalize_cuit(number)
            if "document_number" in attrs:
                attrs["document_number"] = number
            tax_id = document_type in (Customer.DocumentType.CUIT, Customer.DocumentType.CUIL)
            if tax_id and not is_valid_cuit(number):
                raise serializers.ValidationError({"document_number": "Not a valid CUIT/CUIL."})
        # They get Factura A, which needs the CUIT.
        if vat_condition in CONDICIONES_A and not (document_type == Customer.DocumentType.CUIT and number):
            raise serializers.ValidationError(
                {"document_number": f"A {Customer.VatCondition(vat_condition).label} customer needs a CUIT."})
        return attrs


# The serializers below leave out phone and document_number: only the customer detail needs them.

class CustomerChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ["id", "name", "image"]


class CustomerSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ["id", "name", "email", "image"]


class ProductSummarySerializer(serializers.ModelSerializer):
    active_price = serializers.IntegerField(read_only=True, allow_null=True)

    class Meta:
        model = Product
        fields = ["id", "slug", "name", "price", "discount_percent", "active_price", "image"]


class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.IntegerField(read_only=True)
    product_detail = ProductSummarySerializer(read_only=True, source='product')
    product = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.filter(status=Product.Status.ACTIVE))

    class Meta:
        model = OrderItem
        exclude = ['order']
        read_only_fields = ['unit_price', 'vat_rate']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(read_only=True, many=True)
    total = serializers.IntegerField(read_only=True)
    customer_detail = CustomerSummarySerializer(source="customer", read_only=True)
    # Annotated by OrderViewSet.
    invoice_status = serializers.ChoiceField(choices=ORDER_INVOICE_STATUSES, read_only=True)

    class Meta:
        model = Order
        fields = serializers.ALL_FIELDS


class OrderCreateSerializer(OrderSerializer):
    items = OrderItemSerializer(many=True)

    def create(self, validated_data):
        order = Order.objects.create_with_items(**validated_data)
        # A new order has no invoice: the instance isn't annotated like the viewset queryset.
        order.invoice_status = "not_invoiced"
        return order
