import json
import logging
from dataclasses import asdict

from django.core.serializers.json import DjangoJSONEncoder
from django.db import transaction

from .adapter import ARCAElectronicInvoicingAdapter
from .models import Invoice, InvoiceSequenceLock
from .arca import get_wsfe

logger = logging.getLogger(__name__)


def emit_invoice(invoice: Invoice):
    if invoice.status == Invoice.Status.SUCCESS:
        raise ValueError("Este comprobante ya fue emitido.")

    with transaction.atomic():
        InvoiceSequenceLock.objects.select_for_update().get_or_create(
            point_of_sale=invoice.point_of_sale, invoice_type=invoice.invoice_type
        )

        try:
            invoicing_adapter = ARCAElectronicInvoicingAdapter(wsfe=get_wsfe())
            result = invoicing_adapter.create_voucher(invoice)

        except Exception as e:
            invoice.status = Invoice.Status.ERROR
            invoice.error_message = str(e)
            invoice.save(update_fields=["status", "error_message", "updated_at"])
            return invoice

        invoice.invoice_number = result.numero
        invoice.cae = result.cae
        invoice.cae_expiration_date = result.cae_vencimiento.strftime("%Y%m%d")
        invoice.afip_response = json.loads(json.dumps(asdict(result), cls=DjangoJSONEncoder))
        invoice.status = Invoice.Status.SUCCESS

        try:
            invoice.save(
                update_fields=[
                    "invoice_number",
                    "afip_response",
                    "cae",
                    "cae_expiration_date",
                    "status",
                    "updated_at",
                ]
            )
        except Exception as e:
            logger.critical(
                "Factura emitida pero error al guardar en local. CAE %s, invoice %s: %s",
                invoice.cae,
                invoice.pk,
                e,
            )

        return invoice
