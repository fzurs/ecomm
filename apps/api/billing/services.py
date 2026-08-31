import logging
from arca.client import ARCAClient
from arca.adapter import ARCAElectronicInvoicingAdapter
from django.db import transaction

from .models import Invoice, InvoiceSequenceLock

logger = logging.getLogger(__name__)


def emit_invoice(invoice: Invoice):
    if invoice.status == Invoice.Status.SUCCESS:
        raise ValueError("Este comprobante ya fue emitido.")

    arca = ARCAClient()
    invoicing_adapter = ARCAElectronicInvoicingAdapter(client=arca)

    with transaction.atomic():
        InvoiceSequenceLock.objects.select_for_update().get_or_create(**invoice)

        try:
            last = arca.electronic_billing.get_last_voucher(
                invoice.point_of_sale, invoice.invoice_type
            )
            invoice.invoice_number = last + 1

            result = invoicing_adapter.create_voucher(invoice)
        except Exception as e:
            invoice.status = Invoice.Status.ERROR
            invoice.error_message = str(e)
            invoice.save(update_fields=["status", "error_message", "updated_at"])
            return invoice

        invoice.afip_response = result
        print(result)

        try:
            invoice.save(
                update_fields=[
                    "invoice_number",
                    "afip_response",
                    "cae",
                    "cae_expiration_time",
                    "status",
                    "updated_at",
                ]
            )
        except Exception as e:
            logger.critical(
                "Factura emitida pero error al guardar en local.",
                invoice.cae,
                invoice.pk,
                e,
            )

        return invoice
