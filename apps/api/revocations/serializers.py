from rest_framework import serializers

from orders.models import Order

from .models import RevocationRequest
from .services import deadline


class RevocationCreateSerializer(serializers.Serializer):
    """What the store's form sends: no session needed, the number and the email prove it."""
    order_number = serializers.CharField(max_length=20)
    email = serializers.EmailField()
    reason = serializers.CharField(max_length=2000, required=False, allow_blank=True)


class RevocationCreatedSerializer(serializers.ModelSerializer):
    class Meta:
        model = RevocationRequest
        fields = ["code"]


class RevocationOrderSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source="customer.name", read_only=True)

    class Meta:
        model = Order
        fields = ["number", "status", "customer_name", "created_at", "delivered_at"]
        read_only_fields = fields


class RevocationRequestSerializer(serializers.ModelSerializer):
    order = RevocationOrderSerializer(read_only=True)
    resolved_by = serializers.CharField(source="resolved_by.username", allow_null=True, default=None)
    # Until when it could be asked: null while the order isn't delivered.
    deadline = serializers.SerializerMethodField()

    class Meta:
        model = RevocationRequest
        fields = ["id", "code", "order", "email", "reason", "status", "refund", "resolution_note",
                  "resolved_by", "created_at", "resolved_at", "deadline"]
        # Changed only by approving or rejecting it.
        read_only_fields = fields

    def get_deadline(self, revocation) -> str | None:
        limit = deadline(revocation.order)
        return limit.isoformat() if limit else None


class RevocationApproveSerializer(serializers.Serializer):
    # A shipped order: its goods are back.
    goods_returned = serializers.BooleanField(default=False)
    note = serializers.CharField(max_length=2000, required=False, allow_blank=True, default="")


class RevocationRejectSerializer(serializers.Serializer):
    note = serializers.CharField(max_length=2000, help_text="Why: the customer gets it by email.")
