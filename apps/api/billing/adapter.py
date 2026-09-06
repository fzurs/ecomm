from billing.models import Invoice
from arca.client import ARCAClient
from arca.wsfe.types import CreateVoucherRequest, VoucherBatch, Voucher


class ARCAElectronicInvoicingAdapter:
    def __init__(self, client: ARCAClient):
        self.client = client

    def get_last_voucher(self, invoice: Invoice):
        return self.client.wsfe.get_last_voucher(
            point_of_sale=invoice.point_of_sale, voucher_type=invoice.invoice_type
        )

    def create_voucher(self, invoice: Invoice):
        request = CreateVoucherRequest(
            header=VoucherBatch(
                quantity=1,
                voucher_type=invoice.invoice_type,
                point_of_sale=invoice.point_of_sale,
            ),
            details=[
                Voucher(
                    concept=1,
                    document_type=invoice.order.customer.document_type,
                    document_number=invoice.order.customer.document_number,
                    voucher_from=invoice.invoice_number,
                    voucher_to=invoice.invoice_number,
                    total_amount=invoice.total_amount,
                    net_amount=invoice.net_amount,
                    vat_amount=invoice.vat_amount,
                    non_taxable_amount=0,
                    tax_amount=0,
                    exempt_amount=0,
                    currency_code="PES",
                    recipient_vat_condition_code=1,
                )
            ],
        )

        return self.client.wsfe.create_voucher(request)
