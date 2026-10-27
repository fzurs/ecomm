from datetime import date
from decimal import Decimal

from arca_client import (
    Alicuota,
    CbteTipo,
    ComprobanteAsociado,
    ComprobanteAutorizado,
    Concepto,
    CondicionIVAReceptor,
    DocTipo,
    Emisor,
    IvaAlicuota,
    Receptor,
    render_invoice_pdf,
)
from django.conf import settings

from .amounts import to_items
from .models import Invoice
from .rules import InvoicingError

ISSUER_SETTINGS = [
    'ARCA_ISSUER_LEGAL_NAME',
    'ARCA_ISSUER_ADDRESS',
    'ARCA_ISSUER_ACTIVITY_START',
    'ARCA_ISSUER_GROSS_INCOME',
]


def invoice_pdf(invoice: Invoice) -> bytes:
    """The PDF of an authorized voucher, with its ARCA QR code."""
    if invoice.status != Invoice.Status.AUTHORIZED:
        raise InvoicingError('Only an authorized voucher has a PDF.')
    lines = list(invoice.lines.all())
    if not lines:
        raise InvoicingError('The voucher has no lines to print.')
    return render_invoice_pdf(
        authorized_voucher(invoice),
        issuer(),
        to_items(lines, invoice.letter),
        Receptor(nombre=invoice.receptor_name, domicilio=invoice.receptor_address),
    )


def issuer() -> Emisor:
    missing = [name for name in ISSUER_SETTINGS if not getattr(settings, name)]
    if missing:
        raise InvoicingError(f'Set {", ".join(missing)} in apps/api/.env to print vouchers.')
    return Emisor(
        razon_social=settings.ARCA_ISSUER_LEGAL_NAME,
        domicilio=settings.ARCA_ISSUER_ADDRESS,
        inicio_actividades=date.fromisoformat(settings.ARCA_ISSUER_ACTIVITY_START),
        ingresos_brutos=settings.ARCA_ISSUER_GROSS_INCOME,
    )


def authorized_voucher(invoice: Invoice) -> ComprobanteAutorizado:
    """The voucher as ARCA authorized it, from the saved fields."""
    associated = invoice.associated_invoice
    return ComprobanteAutorizado(
        cuit=int(settings.ARCA_CUIT),
        punto_venta=invoice.point_of_sale,
        tipo=CbteTipo(invoice.voucher_type),
        numero=invoice.number,
        fecha=invoice.issue_date,
        importe_total=invoice.total_amount,
        cae=invoice.cae,
        cae_vencimiento=invoice.cae_expiration_date,
        concepto=Concepto.PRODUCTOS,
        doc_tipo=DocTipo(invoice.receptor_document_type),
        doc_nro=int(invoice.receptor_document_number or 0),
        condicion_iva_receptor=CondicionIVAReceptor(invoice.receptor_vat_condition),
        importe_neto=invoice.net_amount,
        importe_iva=invoice.vat_amount,
        importe_exento=invoice.exempt_amount,
        importe_no_gravado=invoice.non_taxed_amount,
        importe_tributos=Decimal(0),
        iva=[IvaAlicuota(Alicuota(vat.rate), vat.base, vat.amount) for vat in invoice.vat.all()],
        asociados=[ComprobanteAsociado(
            tipo=CbteTipo(associated.voucher_type),
            punto_venta=associated.point_of_sale,
            numero=associated.number,
            cuit=int(settings.ARCA_CUIT),
            fecha=associated.issue_date,
        )] if associated else [],
    )
