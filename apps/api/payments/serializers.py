from rest_framework import serializers

from .models import Payment


class PaymentSummarySerializer(serializers.ModelSerializer):
    """A payment of an order, as the admin shows it."""

    class Meta:
        model = Payment
        fields = ["id", "provider", "provider_payment_id", "status", "status_detail", "amount", "created_at"]
