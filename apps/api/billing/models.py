from django.utils.translation import gettext_lazy as _

from django.db import models
from orders.models import Order


class Invoice(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', _('Pending')
        SUCCESS = 'success', _('Success')
        ERROR = 'error', _('Error')

    order = models.ForeignKey(Order, models.PROTECT, related_name='invoices')

    # Tax information
    point_of_sale = models.PositiveIntegerField(
        verbose_name=_('Point of Sale'))
    invoice_type = models.PositiveIntegerField(verbose_name=_('Invoice Type'))
    invoice_number = models.PositiveIntegerField(
        null=True, blank=True, verbose_name=_('Invoice Number'))

    # Amounts
    net_amount = models.DecimalField(max_digits=12, decimal_places=2)
    vat_amount = models.DecimalField(max_digits=12, decimal_places=2)
    total_amount = models.DecimalField(max_digits=12, decimal_places=2)

    # AFIP response
    cae = models.CharField(max_length=14, blank=True)
    cae_expiration_date = models.CharField(max_length=8, blank=True)

    afip_response = models.JSONField(null=True, blank=True)

    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING)
    error_message = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=['point_of_sale', 'invoice_type', 'invoice_number'], condition=models.Q(
            invoice_number__isnull=False), name='unique_afip_invoice')]
        indexes = [models.Index(fields=['order', 'status'])]

    def __str__(self):
        number = self.invoice_number or _('Not issued')
        return (
            f'Invoice {self.point_of_sale:04d}-{number} '
            f'({self.get_status_display()})'
        )


class InvoiceSequenceLock(models.Model):
    point_of_sale = models.PositiveIntegerField(
        verbose_name=_('Point of Sale'))
    invoice_type = models.PositiveIntegerField(verbose_name=_('Invoice Type'))

    class Meta:
        constraints = [models.UniqueConstraint(
            fields=['point_of_sale', 'invoice_type'], name='unique_invoice_sequence_lock')]
