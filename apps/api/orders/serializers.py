from arca_client.certificates import is_valid_cuit, normalize_cuit
from arca_client.wsfe import CONDICIONES_A
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers
from billing.models import ORDER_INVOICE_STATUSES
from billing.rules import order_delete_lock, order_status_locks
from payments.serializers import PaymentSummarySerializer
from django.db import transaction

from . import services, stock
from .models import Order, OrderItem, Customer
from store.models import Product


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = serializers.ALL_FIELDS
        # Linked by the store's checkout, never by hand.
        read_only_fields = ["user"]

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


class OrderStatusLockSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Order.Status.choices)
    reason = serializers.CharField()


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(read_only=True, many=True)
    items_subtotal = serializers.IntegerField(read_only=True)
    total = serializers.IntegerField(read_only=True)
    customer_detail = CustomerSummarySerializer(source="customer", read_only=True)
    # Annotated by OrderViewSet.
    invoice_status = serializers.ChoiceField(choices=ORDER_INVOICE_STATUSES, read_only=True)
    invoice_id = serializers.IntegerField(read_only=True, allow_null=True)
    # The statuses the order can't move to, and why: the admin disables them.
    status_locks = serializers.SerializerMethodField()
    # Why the order can't be deleted, or null.
    delete_lock = serializers.SerializerMethodField()
    # Its Mercado Pago payments, newest first (the store's orders).
    payments = PaymentSummarySerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = serializers.ALL_FIELDS
        # What the customer chose and paid at checkout. The admin fills in the carrier and the
        # tracking number.
        read_only_fields = ["shipping_method", "shipping_province", "shipping_cost"]

    @extend_schema_field(OrderStatusLockSerializer(many=True))
    def get_status_locks(self, order):
        return [{"status": status, "reason": reason}
                for status, reason in order_status_locks(order).items()]

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_delete_lock(self, order):
        return order_delete_lock(order)

    def validate_status(self, status):
        if self.instance and status != self.instance.status:
            reason = order_status_locks(self.instance).get(status)
            if reason:
                raise serializers.ValidationError(reason)
        return status

    @transaction.atomic
    def update(self, instance, validated_data):
        # The status moves the stock: cancelling gives it back, reopening takes it again.
        status = validated_data.pop("status", instance.status)
        if status != instance.status:
            locked = Order.objects.select_for_update().get(pk=instance.pk)
            try:
                services.set_status(locked, status)
            except stock.OutOfStock as exc:
                raise serializers.ValidationError(
                    {"status": f"There isn't enough stock of: {', '.join(exc.names)}."})
            # What set_status saved, so saving the rest doesn't write it back.
            for field in ("status", "stock_reserved", "shipped_at", "delivered_at"):
                setattr(instance, field, getattr(locked, field))
        return super().update(instance, validated_data)


class OrderCreateSerializer(OrderSerializer):
    items = OrderItemSerializer(many=True)

    def validate_status(self, status):
        # It may start charged (or already delivered), but not cancelled.
        if status == Order.Status.CANCELLED:
            raise serializers.ValidationError("An order can't be created cancelled.")
        return status

    def create(self, validated_data):
        try:
            order = Order.objects.create_with_items(**validated_data, reserve=True)
        except stock.OutOfStock as exc:
            raise serializers.ValidationError(
                {"items": f"There isn't enough stock of: {', '.join(exc.names)}."})
        # A new order has no invoice: the instance isn't annotated like the viewset queryset.
        order.invoice_status = "not_invoiced"
        order.invoice_id = None
        order.invoice_uncredited = False
        return order
