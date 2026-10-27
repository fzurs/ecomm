from decimal import Decimal

from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from orders.models import Order
from orders.serializers import CustomerChoiceSerializer

from . import services
from .models import Invoice, InvoiceLine, InvoiceVat, VoucherKind
from .rules import note_support


class ArcaMessageSerializer(serializers.Serializer):
    code = serializers.IntegerField()
    msg = serializers.CharField()


class InvoiceLineSerializer(serializers.ModelSerializer):
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    # How much of it live credit notes credit. Only on invoice lines (0 on notes).
    credited_quantity = serializers.SerializerMethodField()

    class Meta:
        model = InvoiceLine
        fields = [
            "id", "order_item", "credited_line", "description", "quantity", "unit_price",
            "vat_rate", "subtotal", "credited_quantity",
        ]

    def get_credited_quantity(self, line) -> int:
        return self.context.get("credited", {}).get(line.pk, 0)


class InvoiceVatSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceVat
        fields = ["rate", "base", "amount"]


# A related voucher: the invoice of a note, or the notes of an invoice. (A comment, not a
# docstring: drf-spectacular would inherit it as the description of the serializers below.)
class InvoiceSummarySerializer(serializers.ModelSerializer):
    letter = serializers.CharField(read_only=True)
    kind = serializers.ChoiceField(VoucherKind.choices, read_only=True)
    display_number = serializers.CharField(read_only=True, allow_null=True)

    class Meta:
        model = Invoice
        fields = [
            "id", "voucher_type", "letter", "kind", "display_number", "issue_date",
            "total_amount", "status",
        ]
        read_only_fields = fields


class InvoiceSerializer(InvoiceSummarySerializer):
    order_number = serializers.CharField(source="order.number", read_only=True)
    customer = CustomerChoiceSerializer(source="order.customer", read_only=True)
    notes_unavailable_reason = serializers.SerializerMethodField()

    class Meta(InvoiceSummarySerializer.Meta):
        fields = InvoiceSummarySerializer.Meta.fields + [
            "order", "order_number", "customer", "point_of_sale", "number",
            "associated_invoice", "receptor_name", "receptor_document_type",
            "receptor_document_number", "receptor_vat_condition", "receptor_address",
            "net_amount", "vat_amount", "exempt_amount", "non_taxed_amount",
            "cae", "cae_expiration_date", "error_message", "created_at", "updated_at",
            "notes_unavailable_reason",
        ]
        read_only_fields = fields

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_notes_unavailable_reason(self, invoice):
        """Why notes can't be made on this voucher now, or null if they can."""
        if invoice.kind == VoucherKind.INVOICE and invoice.status != Invoice.Status.AUTHORIZED:
            return "Notes can only be made on an authorized invoice."
        return note_support(invoice)


class InvoiceDetailSerializer(InvoiceSerializer):
    associated_invoice = InvoiceSummarySerializer(read_only=True, allow_null=True)
    notes = InvoiceSummarySerializer(many=True, read_only=True)
    lines = serializers.SerializerMethodField()
    vat = InvoiceVatSerializer(many=True, read_only=True)
    arca_errors = ArcaMessageSerializer(many=True, read_only=True)
    observations = ArcaMessageSerializer(many=True, read_only=True)
    credit_available = serializers.SerializerMethodField()

    class Meta(InvoiceSerializer.Meta):
        fields = InvoiceSerializer.Meta.fields + [
            "notes", "lines", "vat", "arca_errors", "observations", "credit_available",
        ]
        read_only_fields = fields

    @extend_schema_field(InvoiceLineSerializer(many=True))
    def get_lines(self, invoice):
        # One query for the credited quantities of every line.
        credited = services.credited_quantities(invoice) if invoice.kind == VoucherKind.INVOICE else {}
        return InvoiceLineSerializer(invoice.lines.all(), many=True, context={"credited": credited}).data

    @extend_schema_field(serializers.DecimalField(max_digits=12, decimal_places=2))
    def get_credit_available(self, invoice):
        if invoice.kind != VoucherKind.INVOICE:
            return "0.00"
        return f"{services.credit_available(invoice):.2f}"


# What creating the invoice of an order would emit. Nothing is saved.
class InvoicePreviewSerializer(InvoiceSerializer):
    lines = InvoiceLineSerializer(many=True, read_only=True, source="preview_lines")

    class Meta(InvoiceSerializer.Meta):
        fields = [
            "voucher_type", "letter", "kind", "order", "order_number", "customer",
            "point_of_sale", "receptor_name", "receptor_document_type",
            "receptor_document_number", "receptor_vat_condition", "receptor_address",
            "net_amount", "vat_amount", "exempt_amount", "non_taxed_amount", "total_amount",
            "lines",
        ]
        read_only_fields = fields


class InvoiceCreateSerializer(serializers.Serializer):
    order = serializers.PrimaryKeyRelatedField(queryset=Order.objects.all())


class CreditNoteLineSerializer(serializers.Serializer):
    line = serializers.PrimaryKeyRelatedField(queryset=InvoiceLine.objects.all())
    quantity = serializers.IntegerField(min_value=1)


class CreditNoteCreateSerializer(serializers.Serializer):
    # Without lines, the note credits everything that is left.
    lines = CreditNoteLineSerializer(many=True, required=False)


class DebitNoteLineSerializer(serializers.ModelSerializer):
    quantity = serializers.IntegerField(min_value=1)
    unit_price = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal("0.01"))

    class Meta:
        model = InvoiceLine
        fields = ["description", "quantity", "unit_price", "vat_rate"]


class DebitNoteCreateSerializer(serializers.Serializer):
    lines = DebitNoteLineSerializer(many=True, allow_empty=False)
