from billing.models import Invoice
from arca.client import ARCAClient
from arca.wsfe.types import CreateVoucherRequest


class ARCAElectronicInvoicingAdapter:
    def __init__(self, client: ARCAClient):
        self.client = client

    def create_voucher(self, invoice: Invoice):
        data = CreateVoucherRequest(
            cant_reg="1",
            cbte_tipo=str(invoice.invoice_type),
            pto_vta=str(invoice.point_of_sale),
            concepto="1",
            doc_tipo=str(invoice.order.customer.document_type),
            doc_nro=invoice.order.customer.document_number,
            cbte_desde=invoice.invoice_number,
            cbte_hasta=invoice.invoice_number,
            imp_total=invoice.total_amount,
            imp_tot_conc=0,
            imp_neto=invoice.net_amount,
            imp_op_ex=0,
            imp_iva=invoice.vat_amount,
            imp_trib=0,
            mon_id="PES",
            condicion_iva_receptor_id="1",
        )

        return self.client.electronic_billing.create_voucher(data)
