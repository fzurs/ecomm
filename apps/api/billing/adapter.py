from arca_client import WSFE, CbteTipo, ComprobanteAutorizado, CondicionIVAReceptor, DocTipo

from billing.models import Invoice


class ARCAElectronicInvoicingAdapter:
    def __init__(self, wsfe: WSFE):
        self.wsfe = wsfe

    def create_voucher(self, invoice: Invoice) -> ComprobanteAutorizado:
        """Emite la factura C y devuelve el comprobante autorizado.

        ARCA asigna el número (último autorizado + 1); viene en ``numero``.
        """
        if invoice.invoice_type != CbteTipo.FACTURA_C:
            raise ValueError(f"Tipo de comprobante no soportado: {invoice.invoice_type}")

        customer = invoice.order.customer
        if customer.document_number:
            doc_tipo = DocTipo(customer.document_type)
            doc_nro = int(customer.document_number)
        else:
            doc_tipo = DocTipo.CONSUMIDOR_FINAL
            doc_nro = 0

        return self.wsfe.create_invoice_c(
            punto_venta=invoice.point_of_sale,
            importe_total=invoice.total_amount,
            doc_tipo=doc_tipo,
            doc_nro=doc_nro,
            # TODO: tomar la condición frente al IVA del cliente cuando el modelo la tenga.
            condicion_iva_receptor=CondicionIVAReceptor.CONSUMIDOR_FINAL,
        )
