from django.db import models

from orders.models import Order


class Payment(models.Model):
    """A charge of an order through Mercado Pago. It's created with the payment link (`created`,
    with its preference); Mercado Pago's notifications fill in its payment and status. Each
    attempt of the customer is one: a rejected card and then an approved one are two."""

    class Provider(models.TextChoices):
        MERCADOPAGO = "mercadopago", "Mercado Pago"

    # Mercado Pago's statuses, plus `created`: the link, before any payment.
    class Status(models.TextChoices):
        CREATED = "created", "Created"
        PENDING = "pending", "Pending"
        IN_PROCESS = "in_process", "In process"
        AUTHORIZED = "authorized", "Authorized"
        IN_MEDIATION = "in_mediation", "In mediation"
        APPROVED = "approved", "Approved"
        REJECTED = "rejected", "Rejected"
        CANCELLED = "cancelled", "Cancelled"
        REFUNDED = "refunded", "Refunded"
        CHARGED_BACK = "charged_back", "Charged back"

    # Started and not settled yet: e.g. cash, until it's paid at the counter. The order waits.
    IN_PROGRESS = [Status.PENDING, Status.IN_PROCESS, Status.AUTHORIZED, Status.IN_MEDIATION]

    order = models.ForeignKey(Order, models.PROTECT, related_name="payments")
    provider = models.CharField(max_length=20, choices=Provider.choices, default=Provider.MERCADOPAGO)
    preference_id = models.CharField(max_length=100, blank=True)
    provider_payment_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.CREATED)
    # Why: e.g. `cc_rejected_insufficient_amount`.
    status_detail = models.CharField(max_length=100, blank=True)
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    # What Mercado Pago answered about the payment, as it was.
    raw = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at", "-pk"]

    def __str__(self):
        return f"{self.get_provider_display()} {self.provider_payment_id or self.preference_id} ({self.status})"
