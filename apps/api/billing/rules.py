"""Which voucher an invoice or note is, and who it goes to. Checked before saving, so a
preview shows the same errors that emitting would."""
from arca_client.certificates import is_valid_cuit, normalize_cuit
from arca_client.wsfe import CONDICIONES_A
from django.conf import settings

from orders.models import Customer

from .models import ReceptorDocumentType, VoucherKind, VoucherType

# What arca-client 0.2.0 can emit. B and C notes are missing (see its README, "Limitaciones
# conocidas"): when it adds them, add them here and to the adapter.
SUPPORTED_TYPES = {
    VoucherType.INVOICE_A,
    VoucherType.INVOICE_B,
    VoucherType.INVOICE_C,
    VoucherType.CREDIT_NOTE_A,
    VoucherType.DEBIT_NOTE_A,
}

DOCUMENT_TYPES = {
    Customer.DocumentType.CUIT: ReceptorDocumentType.CUIT,
    Customer.DocumentType.CUIL: ReceptorDocumentType.CUIL,
    Customer.DocumentType.DNI: ReceptorDocumentType.DNI,
}


class InvoicingError(Exception):
    """A voucher that can't be created or emitted, with a message for the user."""


class UnsupportedVoucher(InvoicingError):
    pass


def check_supported(voucher_type: VoucherType) -> None:
    if voucher_type not in SUPPORTED_TYPES:
        raise UnsupportedVoucher(
            f"{voucher_type.label} can't be emitted yet: arca-client doesn't support it.")


def note_support(invoice) -> str | None:
    """Why notes can't be made on `invoice`, or None if they can."""
    if invoice.kind != VoucherKind.INVOICE:
        return 'Notes are made on invoices.'
    for kind in (VoucherKind.CREDIT_NOTE, VoucherKind.DEBIT_NOTE):
        try:
            check_supported(VoucherType.of(invoice.letter, kind))
        except UnsupportedVoucher as e:
            return str(e)
    return None


def invoice_letter(customer: Customer) -> str:
    """A monotributista issues C; a responsable inscripto issues A to registered and
    monotributo customers (they compute the IVA) and B to everyone else."""
    if settings.ARCA_ISSUER_VAT_CONDITION == 'monotributo':
        return 'C'
    return 'A' if customer.vat_condition in CONDICIONES_A else 'B'


def receptor_for(customer: Customer, letter: str) -> dict:
    """The receptor fields of an Invoice for this customer."""
    number = normalize_cuit(customer.document_number or '')
    condition = Customer.VatCondition(customer.vat_condition)

    if letter == 'A' and customer.document_type != Customer.DocumentType.CUIT:
        raise InvoicingError(f'Factura A needs the CUIT of the customer ({condition.label}).')

    if not number:
        if condition != Customer.VatCondition.FINAL_CONSUMER:
            raise InvoicingError(f'A customer with condition "{condition.label}" needs a document.')
        document_type = ReceptorDocumentType.UNIDENTIFIED
    elif customer.document_type in DOCUMENT_TYPES:
        document_type = DOCUMENT_TYPES[customer.document_type]
        if document_type == ReceptorDocumentType.DNI:
            valid = number.isdigit() and len(number) <= 8
        else:
            valid = is_valid_cuit(number)
        if not valid:
            raise InvoicingError(f'The {document_type.label} of the customer is not valid: {number}.')
    else:
        document = Customer.DocumentType(customer.document_type).label
        raise InvoicingError(
            f"arca-client doesn't accept {document} as the receptor document: set a CUIT, CUIL "
            f"or DNI, or leave it empty to invoice an unidentified final consumer."
        )

    return {
        'receptor_name': customer.invoice_name,
        'receptor_document_type': document_type,
        'receptor_document_number': number,
        'receptor_vat_condition': condition,
        'receptor_address': customer.address,
    }
