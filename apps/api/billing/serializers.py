from decimal import Decimal

from rest_framework import serializers

from orders.models import Order

from .models import Invoice


class InvoiceSerializer(serializers.ModelSerializer):
    document_name = serializers.SerializerMethodField()

    class Meta:
        model = Invoice
        fields = [
            "id",
            "order",
            "total_amount",
            "net_amount",
            "vat_amount",
            "document_name",
            "created_at",
            "status",
        ]
        read_only_fields = ["total_amount", "net_amount", "vat_amount", "status"]

    def create(self, validated_data):
        order = validated_data.pop("order")
        vat_amount = order.total * Decimal("0.21") / Decimal("1.21")
        net_amount = order.total - vat_amount
        return Invoice.objects.create(
            order=order,
            point_of_sale=1,
            invoice_type=1,
            net_amount=net_amount,
            vat_amount=vat_amount,
            total_amount=order.total,
        )

    def get_document_name(self, obj: Invoice):
        return f"{obj.order.customer.name}-{obj.invoice_number}"

    def validate_order(self, order):
        if order.status != Order.Status.PAID:
            raise serializers.ValidationError(
                "The order must be paid before creating an invoice."
            )

        return order
