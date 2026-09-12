from django.test import SimpleTestCase

from orders.models import Order, Customer

from .adapter import ARCAElectronicInvoicingAdapter
from .arca import get_arca_client
from .models import Invoice


class ARCAElectronicInvoicingAdapterTests(SimpleTestCase):
    def setUp(self):
        self.arca = get_arca_client("arca_test")
        self.invoicing_adapter = ARCAElectronicInvoicingAdapter(client=self.arca)

    def test_get_currency_types(self):
        currencies = self.arca.wsfe.get_currency_types()
        self.assertIsInstance(currencies, list)
        self.assertGreater(len(currencies), 0)

    def test_get_vat_receptor_condition(self):
        conditions = self.arca.wsfe.get_vat_receptor_condition()

        self.assertIsInstance(conditions, list)
        self.assertGreater(len(conditions), 0)

    def test_create_voucher(self):
        customer = Customer.objects.create(
            name="Jerry", email="jerry@example.com", document_number="20440237577"
        )
        order = Order.objects.create(customer=customer)

        invoice = Invoice.objects.create(
            order=order,
            point_of_sale=1,
            invoice_type=1,
            net_amount=100,
            vat_amount=21,
            total_amount=121,
        )

        response = self.invoicing_adapter.create_voucher(invoice)

        print("Success response", response)
