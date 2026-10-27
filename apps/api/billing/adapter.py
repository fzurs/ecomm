from arca_client import (
    WSFE,
    CbteTipo,
    ComprobanteAsociado,
    ComprobanteAutorizado,
    CondicionIVAReceptor,
    DocTipo,
)
from . import amounts
from .arca import issuer_cuit
from .models import Invoice, VoucherType
from .rules import check_supported


class ARCAElectronicInvoicingAdapter:
    def __init__(self, wsfe: WSFE):
        self.wsfe = wsfe

    def create_voucher(self, invoice: Invoice) -> ComprobanteAutorizado:
        """Emits the voucher and returns it authorized.

        ARCA assigns the number (last authorized + 1); it comes in ``numero``.
        """
        check_supported(invoice.type)
        kwargs = {
            'punto_venta': invoice.point_of_sale,
            **amounts.voucher_amounts(invoice.lines.all(), invoice.letter),
            'doc_nro': int(invoice.receptor_document_number or 0),
            'condicion_iva_receptor': CondicionIVAReceptor(invoice.receptor_vat_condition),
        }
        # Factura A and its notes always go to a CUIT: arca-client doesn't take doc_tipo there.
        if invoice.letter != 'A':
            kwargs['doc_tipo'] = DocTipo(invoice.receptor_document_type)

        match invoice.type:
            case VoucherType.INVOICE_A:
                return self.wsfe.create_invoice_a(**kwargs)
            case VoucherType.INVOICE_B:
                return self.wsfe.create_invoice_b(**kwargs)
            case VoucherType.INVOICE_C:
                return self.wsfe.create_invoice_c(**kwargs)
            case VoucherType.CREDIT_NOTE_A:
                return self.wsfe.create_credit_note_a(asociado=self.associated(invoice), **kwargs)
            case VoucherType.DEBIT_NOTE_A:
                return self.wsfe.create_debit_note_a(asociado=self.associated(invoice), **kwargs)

    def get_voucher(self, invoice: Invoice) -> ComprobanteAutorizado | None:
        """The voucher ARCA has with the invoice's number, if any. Emits nothing."""
        return self.wsfe.get_voucher(
            invoice.point_of_sale, CbteTipo(invoice.voucher_type), invoice.number)

    @staticmethod
    def associated(note: Invoice) -> ComprobanteAsociado:
        invoice = note.associated_invoice
        return ComprobanteAsociado(
            tipo=CbteTipo(invoice.voucher_type),
            punto_venta=invoice.point_of_sale,
            numero=invoice.number,
            cuit=issuer_cuit(),
            fecha=invoice.issue_date,
        )
