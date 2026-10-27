from decimal import Decimal

from django.db import models
from django.utils.translation import gettext_lazy as _

from orders.models import Customer, Order, OrderItem
from store.models import VatRate


class VoucherType(models.IntegerChoices):
    """ARCA voucher types (CbteTipo). The B and C notes are here for when arca-client
    supports them: today `billing.rules` refuses to create them."""
    INVOICE_A = 1, _('Factura A')
    DEBIT_NOTE_A = 2, _('Nota de Débito A')
    CREDIT_NOTE_A = 3, _('Nota de Crédito A')
    INVOICE_B = 6, _('Factura B')
    DEBIT_NOTE_B = 7, _('Nota de Débito B')
    CREDIT_NOTE_B = 8, _('Nota de Crédito B')
    INVOICE_C = 11, _('Factura C')
    DEBIT_NOTE_C = 12, _('Nota de Débito C')
    CREDIT_NOTE_C = 13, _('Nota de Crédito C')

    @property
    def letter(self) -> str:
        return VOUCHER_TYPES[self][0]

    @property
    def kind(self) -> 'VoucherKind':
        return VOUCHER_TYPES[self][1]

    @classmethod
    def of(cls, letter: str, kind: 'VoucherKind') -> 'VoucherType':
        return next(t for t, spec in VOUCHER_TYPES.items() if spec == (letter, kind))


class VoucherKind(models.TextChoices):
    INVOICE = 'invoice', _('Invoice')
    CREDIT_NOTE = 'credit_note', _('Credit note')
    DEBIT_NOTE = 'debit_note', _('Debit note')


VOUCHER_TYPES = {
    VoucherType.INVOICE_A: ('A', VoucherKind.INVOICE),
    VoucherType.DEBIT_NOTE_A: ('A', VoucherKind.DEBIT_NOTE),
    VoucherType.CREDIT_NOTE_A: ('A', VoucherKind.CREDIT_NOTE),
    VoucherType.INVOICE_B: ('B', VoucherKind.INVOICE),
    VoucherType.DEBIT_NOTE_B: ('B', VoucherKind.DEBIT_NOTE),
    VoucherType.CREDIT_NOTE_B: ('B', VoucherKind.CREDIT_NOTE),
    VoucherType.INVOICE_C: ('C', VoucherKind.INVOICE),
    VoucherType.DEBIT_NOTE_C: ('C', VoucherKind.DEBIT_NOTE),
    VoucherType.CREDIT_NOTE_C: ('C', VoucherKind.CREDIT_NOTE),
}


class ReceptorDocumentType(models.IntegerChoices):
    """The DocTipo values arca-client accepts for the receptor."""
    CUIT = 80, _('CUIT')
    CUIL = 86, _('CUIL')
    DNI = 96, _('DNI')
    UNIDENTIFIED = 99, _('Sin identificar')


class Invoice(models.Model):
    """Any ARCA voucher: invoice, credit note or debit note (see `VoucherType`)."""

    class Status(models.TextChoices):
        PENDING = 'pending', _('Pending')
        AUTHORIZED = 'authorized', _('Authorized')
        # ARCA (or a local check) refused it, or it was never received: it can be emitted again.
        REJECTED = 'rejected', _('Rejected')
        # The connection dropped and ARCA couldn't be asked whether it was authorized. Emitting
        # it again could duplicate it: only `verify` can move it.
        UNVERIFIED = 'unverified', _('Unverified')

    order = models.ForeignKey(Order, models.PROTECT, related_name='invoices')
    # The invoice a note adjusts. Invoices have none.
    associated_invoice = models.ForeignKey(
        'self', models.PROTECT, null=True, blank=True, related_name='notes')

    point_of_sale = models.PositiveIntegerField(verbose_name=_('Point of Sale'))
    voucher_type = models.PositiveSmallIntegerField(choices=VoucherType.choices)
    # Assigned by ARCA. Also set on an unverified voucher: the number it was emitted with.
    number = models.PositiveIntegerField(null=True, blank=True)
    issue_date = models.DateField(null=True, blank=True)

    # The receptor as it was invoiced, so later edits of the customer don't change it.
    receptor_name = models.CharField(max_length=255)
    receptor_document_type = models.PositiveSmallIntegerField(choices=ReceptorDocumentType.choices)
    receptor_document_number = models.CharField(max_length=11, blank=True)
    receptor_vat_condition = models.PositiveSmallIntegerField(choices=Customer.VatCondition.choices)
    receptor_address = models.CharField(max_length=255, blank=True)

    # Estimated from the lines when created; replaced by what ARCA authorized.
    net_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal(0))
    vat_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal(0))
    exempt_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal(0))
    non_taxed_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal(0))
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal(0))

    cae = models.CharField(max_length=14, blank=True)
    cae_expiration_date = models.DateField(null=True, blank=True)

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    error_message = models.TextField(blank=True)
    # [{"code": int, "msg": str}] as ARCA sent them.
    arca_errors = models.JSONField(default=list, blank=True)
    observations = models.JSONField(default=list, blank=True)
    # The authorized `ComprobanteAutorizado`, as JSON. The PDF is rendered from it.
    arca_response = models.JSONField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            # Only among authorized ones: an unverified voucher keeps the number it was emitted
            # with, and if ARCA never got it, the next emission of its type gets that number.
            models.UniqueConstraint(
                fields=['point_of_sale', 'voucher_type', 'number'],
                condition=models.Q(status='authorized'),
                name='unique_afip_invoice',
            ),
            # A rejected invoice is retried in place, so an order never needs two.
            models.UniqueConstraint(
                fields=['order'],
                condition=models.Q(associated_invoice__isnull=True) & ~models.Q(status='rejected'),
                name='one_invoice_per_order',
            ),
        ]
        indexes = [models.Index(fields=['order', 'status'])]

    @property
    def type(self) -> VoucherType:
        return VoucherType(self.voucher_type)

    @property
    def letter(self) -> str:
        return self.type.letter

    @property
    def kind(self) -> VoucherKind:
        return self.type.kind

    @property
    def display_number(self) -> str | None:
        if self.number is None:
            return None
        return f'{self.point_of_sale:05d}-{self.number:08d}'

    def __str__(self):
        number = self.display_number or _('not issued')
        return f'{self.type.label} {number} ({self.get_status_display()})'


class InvoiceLine(models.Model):
    invoice = models.ForeignKey(Invoice, models.CASCADE, related_name='lines')
    # The sold item, on invoice lines and on the credit note lines that return it.
    order_item = models.ForeignKey(
        OrderItem, models.SET_NULL, null=True, blank=True, related_name='invoice_lines')
    # On a credit note line, the invoice line it credits.
    credited_line = models.ForeignKey(
        'self', models.PROTECT, null=True, blank=True, related_name='credits')
    description = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField()
    # IVA included, like the store prices.
    unit_price = models.DecimalField(max_digits=12, decimal_places=2)
    vat_rate = models.PositiveSmallIntegerField(choices=VatRate.choices)

    class Meta:
        ordering = ['id']

    @property
    def subtotal(self) -> Decimal:
        return self.unit_price * self.quantity

    def __str__(self):
        return f'{self.quantity} × {self.description}'


class InvoiceVat(models.Model):
    """IVA per rate, as ARCA authorized it."""
    invoice = models.ForeignKey(Invoice, models.CASCADE, related_name='vat')
    rate = models.PositiveSmallIntegerField(choices=VatRate.choices)
    base = models.DecimalField(max_digits=12, decimal_places=2)
    amount = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        ordering = ['rate']


class InvoiceSequenceLock(models.Model):
    point_of_sale = models.PositiveIntegerField(verbose_name=_('Point of Sale'))
    voucher_type = models.PositiveSmallIntegerField(choices=VoucherType.choices)

    class Meta:
        constraints = [models.UniqueConstraint(
            fields=['point_of_sale', 'voucher_type'], name='unique_invoice_sequence_lock')]
