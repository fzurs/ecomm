from django.conf import settings
from django.test import SimpleTestCase
from django.utils import timezone
from arca.wsaa.cache import DjangoAccessTicketCache
from arca.wsfe.types import CreateVoucherRequest, CAEA
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
        currencies = self.arca.wsfe.get_currency_types()
        self.assertIsInstance(currencies, list)
        self.assertGreater(len(currencies), 0)

    def test_get_vat_receptor_condition(self):
        conditions = self.arca.wsfe.get_vat_receptor_condition()

        self.assertIsInstance(conditions, list)
        self.assertGreater(len(conditions), 0)

    def test_create_voucher(self):
        pto_vta, cbte_tipo = 1, 1
        cbte_nro = (
            self.arca.wsfe.get_last_voucher(pto_vta=pto_vta, cbte_tipo=cbte_tipo) + 1
        )

        data = CreateVoucherRequest(
            cant_reg="1",
            cbte_tipo=cbte_tipo,
            pto_vta=pto_vta,
            concepto="1",
            doc_tipo="96",
            doc_nro="20440237577",
            cbte_desde=cbte_nro - 1,
            cbte_hasta=cbte_nro,
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

        caea = CAEA(period=timezone.now(), order=2)

        response = self.arca.wsfe.create_voucher(data, caea)
        print("Success response", response)
