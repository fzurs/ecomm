import logging

from django.db import transaction

from arca.client import ARCAClient

from .adapter import ARCAElectronicInvoicingAdapter
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
            last_voucher = arca.wsfe.get_last_voucher(
                pto_vta=invoice.point_of_sale, cbte_tipo=invoice.invoice_type
            )
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
