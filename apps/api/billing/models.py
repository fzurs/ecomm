from django.utils.translation import gettext_lazy as _

from django.db import models
from orders.models import Order


class Invoice(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", _("Pendiente")
        SUCCESS = "success", _("Emitida")
        ERROR = "error", _("Error")

    order = models.ForeignKey(Order, models.PROTECT, related_name="invoices")

    # Datos Fiscales
    pto_vta = models.PositiveIntegerField(verbose_name="Punto de venta")
    cbte_tipo = models.PositiveIntegerField(verbose_name="Tipo de comprobante")
    cbte_nro = models.PositiveIntegerField(
        null=True, blank=True, verbose_name="Numbero de comprobante")

    # Importes (se calculan antes de emitir)
    imp_neto = models.DecimalField(max_digits=12, decimal_places=2)
    imp_iva = models.DecimalField(max_digits=12, decimal_places=2)
    imp_total = models.DecimalField(max_digits=12, decimal_places=2)

    # Resultado de la AFIP
    cae = models.CharField(max_length=14, blank=True)
    cae_vencimientos = models.CharField(max_length=8, blank=True)

    # Respuesta
    afip_response = models.JSONField(null=True, blank=True)

    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING)
    error_message = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["pto_vta", "cbte_tipo", "cbte_nro"], condition=models.Q(
            cbte_nro__isnull=False), name="unique_comprobante_afip")]
        indexes = [models.Index(fields=["order", "status"])]

    def __str__(self):
        return f"Factura {self.pto_vta:04d}-{self.cbte_nro or "sin emitir"} ({self.get_status_display()})"


class InvoiceSequenceLock(models.Model):
    pto_vta = models.PositiveIntegerField(verbose_name="Punto de venta")
    cbte_tipo = models.PositiveIntegerField(verbose_name="Tipo de comprobante")

    class Meta:
        constraints = [models.UniqueConstraint(
            fields=["pto_vta", "cbte_tipo"], name="unique_sequence_lock")]
