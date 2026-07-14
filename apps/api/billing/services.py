import logging
from afip_client import get_afip_client
from django.db import transaction

from .models import Invoice, InvoiceSequenceLock


logger = logging.getLogger(__name__)


def emit_invoice(invoice: Invoice):
    if invoice.status == Invoice.Status.SUCCESS:
        raise ValueError("Este comprobante ya fue emitido.")

    afip = get_afip_client()
    wsfe = afip.ElectronicBilling

    with transaction.atomic():
        InvoiceSequenceLock.objects.select_for_update().get_or_create(**invoice)

        try:
            last = wsfe.getLastVoucher(invoice.pto_vta, invoice.cbte_tipo)
            invoice.cbte_nro = last + 1

            result = wsfe.createVoucher({
                "CantReg": 1,
                "PtoVta": invoice.pto_vta,
                "CbteTipo": invoice.cbte_tipo,
                "Concepto": 1,
                "DocTipo": invoice.order.customer_doc_tipo,
                "DocNro": invoice.order.customer_doc_nro,
                "CbteDesde": invoice.cbte_nro,
                "CbteHasta": invoice.cbte_nro,
                "ImpTotal": float(invoice.imp_total),
                "ImpNeto": float(invoice.imp_neto),
                "ImpIVA": float(invoice.imp_iva),
                "ImpTotConc": 0,
                "ImpOpEx": 0,
                "ImpTrib": 0,
                "MonId": "PES",
                "MonCotiz": 1,
                "CondicionIVAReceptorId": invoice.order.customer_iva_condicion,
                "Iva": [{
                    "Id": 5,
                    "BaseImp": float(invoice.imp_neto),
                    "Importe": float(invoice.imp_iva),
                }],
            })
        except Exception as e:
            invoice.status = Invoice.Status.ERROR
            invoice.error_message = str(e)
            invoice.save(update_fields=[
                         "status", "error_message", "updated_at"])
            return invoice
        
        invoice.afip_response = result
        print(result)

        try:
            invoice.save(update_fields=[
                         "cbte_nro", "afip_response", "cae", "cae_vencimiento", "status", "updated_at"])
        except Exception as e:
            logger.critical(
                "Factura emitida pero error al guardar en local.", invoice.cae, invoice.pk, e)

        return invoice
