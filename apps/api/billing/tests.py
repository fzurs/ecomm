from django.conf import settings
from django.test import SimpleTestCase
from arca.wsaa.cache import DjangoAccessTicketCache
from arca.wsfe.types import CreateVoucherRequest
from arca.client import ARCAClient
from arca.wsaa.types import ARCACredentials


class ARCAClientTests(SimpleTestCase):
    def setUp(self):
        credentials = ARCACredentials(
            cuit=settings.ARCA_CUIT,
            certificate_path=settings.ARCA_CERTIFICATE_PATH,
            private_key_path=settings.ARCA_PRIVATE_KEY_PATH,
        )
        cache = DjangoAccessTicketCache("arca_test")
        self.arca = ARCAClient(credentials=credentials, cache=cache)

    def test_get_currency_types(self):
        currencies = self.arca.electronic_billing.get_currency_types()
        self.assertIsInstance(currencies, list)
        self.assertGreater(len(currencies), 0)

    def test_get_vat_receptor_condition(self):
        conditions = self.arca.electronic_billing.get_vat_receptor_condition()

        self.assertIsInstance(conditions, list)
        self.assertGreater(len(conditions), 0)

    def test_create_voucher(self):
        data = CreateVoucherRequest(
            cant_reg="1",
            cbte_tipo="1",
            pto_vta="1",
            concepto="1",
            doc_tipo="96",
            doc_nro="20440237577",
            cbte_desde=1,
            cbte_hasta=1,
            cbte_fch=None,
            imp_total=121,
            imp_tot_conc=0,
            imp_neto=100,
            imp_op_ex=0,
            imp_iva=21,
            imp_trib=0,
            mon_id="PES",
            condicion_iva_receptor_id="1",
        )

        response = self.arca.electronic_billing.create_voucher(data)
        print("Success response", response)
