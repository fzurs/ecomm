import json
import logging
from dataclasses import asdict
from decimal import Decimal

from arca_client import ComprobanteAutorizado, WSAAError, WSFEConnectionError, WSFEError
from django.conf import settings
from django.core.serializers.json import DjangoJSONEncoder
from django.db import DatabaseError, transaction
from django.db.models import Sum

from orders.models import Order

from . import amounts
from .adapter import ARCAElectronicInvoicingAdapter
from .arca import get_wsfe
from .models import Invoice, InvoiceLine, InvoiceSequenceLock, InvoiceVat, VoucherKind, VoucherType
from .rules import InvoicingError, check_supported, invoice_letter, receptor_for

logger = logging.getLogger(__name__)

# Notes in these states count against what is left to credit: a rejected one never existed.
LIVE_STATUSES = [Invoice.Status.PENDING, Invoice.Status.AUTHORIZED, Invoice.Status.UNVERIFIED]


# Building vouchers. Nothing here calls ARCA: `preview` shows what `create_*` would emit.

def build_invoice(order: Order, invoice: Invoice | None = None) -> tuple[Invoice, list[InvoiceLine]]:
    """The invoice of a paid order, unsaved. Pass `invoice` to rebuild a rejected one in place."""
    if order.status != Order.Status.PAID:
        raise InvoicingError('The order must be paid before invoicing it.')
    active = order.invoices.filter(associated_invoice=None).exclude(status=Invoice.Status.REJECTED)
    if active.exists():
        raise InvoicingError(f'Order {order.number} already has an invoice.')

    customer = order.customer
    letter = invoice_letter(customer)
    voucher_type = VoucherType.of(letter, VoucherKind.INVOICE)
    check_supported(voucher_type)

    invoice = invoice or Invoice(order=order)
    invoice.point_of_sale = settings.ARCA_POINT_OF_SALE
    invoice.voucher_type = voucher_type
    for field, value in receptor_for(customer, letter).items():
        setattr(invoice, field, value)

    lines = [
        InvoiceLine(
            order_item=item,
            description=item.product.name,
            quantity=item.quantity,
            unit_price=item.unit_price,
            vat_rate=item.vat_rate,
        )
        for item in order.items.select_related('product')
    ]
    if not lines:
        raise InvoicingError(f'Order {order.number} has no items.')
    set_amounts(invoice, lines)
    return invoice, lines


def credited_quantities(invoice: Invoice) -> dict[int, int]:
    """{invoice line id: quantity already credited by live credit notes}."""
    rows = InvoiceLine.objects.filter(
        credited_line__invoice=invoice, invoice__status__in=LIVE_STATUSES,
    ).values('credited_line').annotate(quantity=Sum('quantity'))
    return {row['credited_line']: row['quantity'] for row in rows}


def build_credit_note(invoice: Invoice, lines: list[tuple[InvoiceLine, int]] | None = None):
    """A credit note for `lines` ([(invoice line, quantity)]), or for all that is left."""
    note = new_note(invoice, VoucherKind.CREDIT_NOTE)
    credited = credited_quantities(invoice)
    remaining = {line.pk: line.quantity - credited.get(line.pk, 0) for line in invoice.lines.all()}
    if lines is None:
        lines = [(line, remaining[line.pk]) for line in invoice.lines.all() if remaining[line.pk] > 0]
        if not lines:
            raise InvoicingError('The invoice is fully credited.')

    note_lines = []
    for line, quantity in lines:
        if line.invoice_id != invoice.pk:
            raise InvoicingError(f'Line {line.pk} is not from invoice {invoice.pk}.')
        if not 0 < quantity <= remaining[line.pk]:
            raise InvoicingError(
                f'"{line.description}": at most {remaining[line.pk]} can be credited.')
        note_lines.append(InvoiceLine(
            order_item_id=line.order_item_id,
            credited_line=line,
            description=line.description,
            quantity=quantity,
            unit_price=line.unit_price,
            vat_rate=line.vat_rate,
        ))
    set_amounts(note, note_lines)
    return note, note_lines


def build_debit_note(invoice: Invoice, lines: list[dict]):
    """A debit note with free lines ({description, quantity, unit_price, vat_rate})."""
    note = new_note(invoice, VoucherKind.DEBIT_NOTE)
    if not lines:
        raise InvoicingError('A debit note needs at least one line.')
    note_lines = [InvoiceLine(**line) for line in lines]
    set_amounts(note, note_lines)
    return note, note_lines


def new_note(invoice: Invoice, kind: VoucherKind) -> Invoice:
    if invoice.kind != VoucherKind.INVOICE:
        raise InvoicingError('Notes are made on invoices.')
    if invoice.status != Invoice.Status.AUTHORIZED:
        raise InvoicingError('Notes can only be made on an authorized invoice.')
    voucher_type = VoucherType.of(invoice.letter, kind)
    check_supported(voucher_type)
    # The receptor of a note is the invoice's, as it was invoiced.
    return Invoice(
        order=invoice.order,
        associated_invoice=invoice,
        point_of_sale=settings.ARCA_POINT_OF_SALE,
        voucher_type=voucher_type,
        **{field: getattr(invoice, field) for field in (
            'receptor_name', 'receptor_document_type', 'receptor_document_number',
            'receptor_vat_condition', 'receptor_address',
        )},
    )


def set_amounts(invoice: Invoice, lines: list[InvoiceLine]) -> None:
    for field, value in amounts.estimate(lines, invoice.letter).items():
        setattr(invoice, field, value)
    if invoice.total_amount <= 0:
        raise InvoicingError('The voucher total must be greater than zero.')


# Creating and emitting.

@transaction.atomic
def save_draft(invoice: Invoice, lines: list[InvoiceLine]) -> Invoice:
    invoice.status = Invoice.Status.PENDING
    invoice.save()
    invoice.lines.all().delete()
    for line in lines:
        line.invoice = invoice
    InvoiceLine.objects.bulk_create(lines)
    return invoice


# `wsfe` defaults to ARCA's (`get_wsfe`); the seed passes a `billing.sample.SampleWSFE`.

def create_invoice(order: Order, wsfe=None) -> Invoice:
    # A rejected invoice of the order is emitted again, rebuilt from the order and customer.
    rejected = order.invoices.filter(associated_invoice=None, status=Invoice.Status.REJECTED).first()
    return emit(save_draft(*build_invoice(order, rejected)), wsfe)


def create_credit_note(invoice: Invoice, lines=None, wsfe=None) -> Invoice:
    return emit(save_draft(*build_credit_note(invoice, lines)), wsfe)


def create_debit_note(invoice: Invoice, lines, wsfe=None) -> Invoice:
    return emit(save_draft(*build_debit_note(invoice, lines)), wsfe)


def retry(invoice: Invoice) -> Invoice:
    """Emits a rejected voucher again. An invoice is rebuilt, in case the customer was fixed."""
    if invoice.status != Invoice.Status.REJECTED:
        raise InvoicingError('Only a rejected voucher can be emitted again.')
    if invoice.kind == VoucherKind.INVOICE:
        return create_invoice(invoice.order)
    return emit(invoice)


def emit(invoice: Invoice, wsfe=None) -> Invoice:
    """Emits a pending or rejected voucher and saves what ARCA answered. Never call it on an
    unverified one: ARCA may have it already (see `verify`)."""
    with transaction.atomic():
        InvoiceSequenceLock.objects.select_for_update().get_or_create(
            point_of_sale=invoice.point_of_sale, voucher_type=invoice.voucher_type)
        # Read again under the lock: a concurrent request may have emitted it meanwhile.
        invoice = Invoice.objects.select_for_update().get(pk=invoice.pk)
        if invoice.status not in (Invoice.Status.PENDING, Invoice.Status.REJECTED):
            raise InvoicingError(f'A voucher in status "{invoice.status}" can\'t be emitted.')

        adapter = ARCAElectronicInvoicingAdapter(wsfe=wsfe or get_wsfe())
        try:
            result = adapter.create_voucher(invoice)
        except WSFEConnectionError as e:
            if e.safe_to_retry:
                return reject(invoice, str(e))
            # ARCA may have authorized it: keep the number it was emitted with, to verify it.
            invoice.number = e.numero
            invoice.status = Invoice.Status.UNVERIFIED
            invoice.error_message = str(e)
            invoice.save(update_fields=['number', 'status', 'error_message', 'updated_at'])
            return invoice
        except WSFEError as e:
            return reject(invoice, str(e), errors=e.errores, observations=e.observaciones or [])
        except (WSAAError, ValueError, TypeError) as e:
            return reject(invoice, str(e))

        try:
            with transaction.atomic():
                authorize(invoice, result)
        except DatabaseError:
            logger.critical(
                'Voucher authorized but not saved. CAE %s, number %s, invoice %s',
                result.cae, result.numero, invoice.pk, exc_info=True,
            )
            raise
        return invoice


def verify(invoice: Invoice, wsfe=None) -> Invoice:
    """Asks ARCA for an unverified voucher: authorized if it has it, rejected (can be emitted
    again) if it doesn't."""
    with transaction.atomic():
        invoice = Invoice.objects.select_for_update().get(pk=invoice.pk)
        if invoice.status != Invoice.Status.UNVERIFIED:
            raise InvoicingError('Only an unverified voucher can be verified.')

        # ARCA gave its number to a later emission: it never got this one.
        taken = Invoice.objects.filter(
            point_of_sale=invoice.point_of_sale, voucher_type=invoice.voucher_type,
            number=invoice.number, status=Invoice.Status.AUTHORIZED,
        ).exclude(pk=invoice.pk).first()
        if taken:
            invoice.number = None
            return reject(invoice, f'ARCA authorized {taken} with its number: it can be emitted again.')

        try:
            result = ARCAElectronicInvoicingAdapter(wsfe=wsfe or get_wsfe()).get_voucher(invoice)
        except (WSFEConnectionError, WSFEError, WSAAError) as e:
            raise InvoicingError(f"ARCA couldn't be asked: {e}") from e

        if result is None:
            invoice.number = None
            return reject(invoice, 'ARCA has no record of the voucher: it can be emitted again.')
        if (
            result.importe_total != invoice.total_amount
            or result.doc_nro != int(invoice.receptor_document_number or 0)
        ):
            # Another voucher took the number: this one stays unverified, to check by hand.
            raise InvoicingError(
                f'ARCA has voucher {invoice.display_number} with other data (total '
                f'{result.importe_total}, document {result.doc_nro}): check it by hand.'
            )
        authorize(invoice, result)
        return invoice


def reject(invoice: Invoice, message: str, errors=(), observations=()) -> Invoice:
    invoice.status = Invoice.Status.REJECTED
    invoice.error_message = message
    invoice.arca_errors = messages(errors)
    invoice.observations = messages(observations)
    invoice.save(update_fields=[
        'number', 'status', 'error_message', 'arca_errors', 'observations', 'updated_at'])
    return invoice


def authorize(invoice: Invoice, result: ComprobanteAutorizado) -> None:
    invoice.number = result.numero
    invoice.issue_date = result.fecha
    invoice.cae = result.cae
    invoice.cae_expiration_date = result.cae_vencimiento
    invoice.total_amount = result.importe_total
    if invoice.letter == 'C':
        invoice.net_amount = result.importe_total - result.importe_tributos
    else:
        invoice.net_amount = result.importe_neto
        invoice.vat_amount = result.importe_iva
        invoice.exempt_amount = result.importe_exento
        invoice.non_taxed_amount = result.importe_no_gravado
    invoice.arca_response = json.loads(json.dumps(asdict(result), cls=DjangoJSONEncoder))
    invoice.observations = messages(result.observaciones)
    invoice.arca_errors = []
    invoice.error_message = ''
    invoice.status = Invoice.Status.AUTHORIZED
    invoice.save()
    invoice.vat.all().delete()
    InvoiceVat.objects.bulk_create(
        InvoiceVat(invoice=invoice, rate=int(iva.alicuota), base=iva.base_imponible, amount=iva.importe)
        for iva in result.iva
    )


def messages(items) -> list[dict]:
    return [{'code': item.code, 'msg': item.msg} for item in items]


def credit_available(invoice: Invoice) -> Decimal:
    """What is left to credit of the invoice lines, at their price (IVA included)."""
    credited = credited_quantities(invoice)
    return sum(
        (max(line.quantity - credited.get(line.pk, 0), 0) * line.unit_price for line in invoice.lines.all()),
        Decimal(0),
    )
