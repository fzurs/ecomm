import logging

from django.db import transaction

from .adapter import ARCAElectronicInvoicingAdapter
from .models import Invoice, InvoiceSequenceLock
from .arca import arca_client

logger = logging.getLogger(__name__)

invoicing_adapter = ARCAElectronicInvoicingAdapter(client=arca_client)


def emit_invoice(invoice: Invoice):
    if invoice.status == Invoice.Status.SUCCESS:
        raise ValueError("Este comprobante ya fue emitido.")

    with transaction.atomic():
        InvoiceSequenceLock.objects.select_for_update().get_or_create(**invoice)

        try:
            last_voucher = invoicing_adapter.get_last_voucher(invoice)
            invoice.invoice_number = last_voucher + 1

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
