from django.conf import settings
from django.db import models

from orders.models import Order


class RevocationRequest(models.Model):
    """A customer revoking a purchase with the "botón de arrepentimiento" (Res. 424/2020): within
    10 days of the purchase or the delivery, whichever is later, without giving a reason. The
    store answers with its code, and the admin approves it (refunding the payment and crediting
    the invoice) or rejects it."""

    class Status(models.TextChoices):
        REQUESTED = "requested", "Requested"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"

    # How the money went back: Mercado Pago's refund, or by hand (an order made in the admin).
    class Refund(models.TextChoices):
        MERCADOPAGO = "mercadopago", "Mercado Pago"
        MANUAL = "manual", "Manual"

    code = models.CharField(max_length=20, unique=True, editable=False)
    order = models.ForeignKey(Order, models.PROTECT, related_name="revocations")
    # As given: the order's customer's.
    email = models.EmailField()
    reason = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.REQUESTED)
    refund = models.CharField(max_length=20, choices=Refund.choices, blank=True)
    # Why it was rejected, or a note on the approval; the customer gets it by email.
    resolution_note = models.TextField(blank=True)
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, models.SET_NULL, null=True, blank=True, related_name="+")
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at", "-pk"]
        constraints = [
            # One open request per order.
            models.UniqueConstraint(
                fields=["order"], condition=models.Q(status="requested"),
                name="revocation_one_open_per_order"),
        ]

    def save(self, *args, **kwargs):
        if not self.code:
            super().save(*args, **kwargs)
            self.code = f"ARR-{self.pk:06d}"
            super().save(update_fields=["code"])
            return
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.code} ({self.order.number})"
