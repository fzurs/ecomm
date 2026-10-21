import os
import tempfile
import unittest
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal
from unittest import mock

from arca_client import (
    AccessTicket,
    CbteTipo,
    ComprobanteAutorizado,
    Concepto,
    CondicionIVAReceptor,
    DocTipo,
)
from django.core.cache.backends.locmem import LocMemCache
from django.test import SimpleTestCase, TestCase, override_settings

from orders.models import Order, Customer

from .adapter import ARCAElectronicInvoicingAdapter
from .arca import DjangoTicketCache, get_wsfe
from .models import Invoice
from .services import emit_invoice


def make_voucher(**kwargs) -> ComprobanteAutorizado:
    data = dict(
        cuit=20111111112,
        punto_venta=1,
        tipo=CbteTipo.FACTURA_C,
        numero=8,
        fecha=date(2026, 10, 21),
        importe_total=Decimal("121.00"),
        cae="76123456789012",
        cae_vencimiento=date(2026, 10, 31),
        concepto=Concepto.PRODUCTOS,
        doc_tipo=DocTipo.CUIT,
        doc_nro=20440237577,
        condicion_iva_receptor=CondicionIVAReceptor.CONSUMIDOR_FINAL,
    )
    return ComprobanteAutorizado(**(data | kwargs))


class DjangoTicketCacheTests(SimpleTestCase):
    def setUp(self):
        self.cache = DjangoTicketCache(LocMemCache("arca-tests", {}))

    def make_ticket(self, expires_in: timedelta) -> AccessTicket:
        now = datetime.now(timezone.utc)
        return AccessTicket(
            token="token",
            sign="sign",
            generation_time=now - timedelta(minutes=1),
            expiration_time=now + expires_in,
        )

    def test_roundtrip(self):
        ticket = self.make_ticket(timedelta(hours=12))
        self.cache.set("wsfe", ticket)

        self.assertEqual(self.cache.get("wsfe"), ticket)

    def test_missing_key(self):
        self.assertIsNone(self.cache.get("wsfe"))

    def test_expired_ticket_is_not_stored(self):
        self.cache.set("wsfe", self.make_ticket(timedelta(seconds=-1)))

        self.assertIsNone(self.cache.get("wsfe"))


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class ARCAElectronicInvoicingAdapterTests(TestCase):
    def setUp(self):
        self.wsfe = mock.Mock()
        self.wsfe.create_invoice_c.return_value = make_voucher()
        self.invoicing_adapter = ARCAElectronicInvoicingAdapter(wsfe=self.wsfe)

    def make_invoice(self, document_number="20440237577", **kwargs) -> Invoice:
        customer = Customer.objects.create(
            name="Jerry", email="jerry@example.com", document_number=document_number
        )
        order = Order.objects.create(customer=customer)
        data = dict(
            order=order,
            point_of_sale=1,
            invoice_type=CbteTipo.FACTURA_C,
            net_amount=121,
            vat_amount=0,
            total_amount=121,
        )
        return Invoice.objects.create(**(data | kwargs))

    def test_create_voucher_with_identified_customer(self):
        invoice = self.make_invoice()

        response = self.invoicing_adapter.create_voucher(invoice)

        self.assertEqual(response, self.wsfe.create_invoice_c.return_value)
        self.wsfe.create_invoice_c.assert_called_once_with(
            punto_venta=1,
            importe_total=Decimal("121.00"),
            doc_tipo=DocTipo.CUIT,
            doc_nro=20440237577,
            condicion_iva_receptor=CondicionIVAReceptor.CONSUMIDOR_FINAL,
        )

    def test_create_voucher_without_document_is_consumidor_final(self):
        invoice = self.make_invoice(document_number="")

        self.invoicing_adapter.create_voucher(invoice)

        kwargs = self.wsfe.create_invoice_c.call_args.kwargs
        self.assertEqual(kwargs["doc_tipo"], DocTipo.CONSUMIDOR_FINAL)
        self.assertEqual(kwargs["doc_nro"], 0)

    def test_create_voucher_rejects_unsupported_type(self):
        invoice = self.make_invoice(invoice_type=1)

        with self.assertRaises(ValueError):
            self.invoicing_adapter.create_voucher(invoice)

        self.wsfe.create_invoice_c.assert_not_called()


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class EmitInvoiceTests(TestCase):
    def setUp(self):
        customer = Customer.objects.create(
            name="Jerry", email="jerry@example.com", document_number="20440237577"
        )
        self.invoice = Invoice.objects.create(
            order=Order.objects.create(customer=customer),
            point_of_sale=1,
            invoice_type=CbteTipo.FACTURA_C,
            net_amount=121,
            vat_amount=0,
            total_amount=121,
        )
        self.wsfe = mock.Mock()
        patcher = mock.patch("billing.services.get_wsfe", return_value=self.wsfe)
        patcher.start()
        self.addCleanup(patcher.stop)

    def test_success_saves_cae(self):
        self.wsfe.create_invoice_c.return_value = make_voucher()

        emit_invoice(self.invoice)

        self.invoice.refresh_from_db()
        self.assertEqual(self.invoice.status, Invoice.Status.SUCCESS)
        self.assertEqual(self.invoice.invoice_number, 8)
        self.assertEqual(self.invoice.cae, "76123456789012")
        self.assertEqual(self.invoice.cae_expiration_date, "20261031")
        self.assertEqual(self.invoice.afip_response["cae"], "76123456789012")
        self.assertEqual(self.invoice.afip_response["importe_total"], "121.00")

    def test_error_saves_message(self):
        self.wsfe.create_invoice_c.side_effect = Exception("10016: CbteFch inválida")

        emit_invoice(self.invoice)

        self.invoice.refresh_from_db()
        self.assertEqual(self.invoice.status, Invoice.Status.ERROR)
        self.assertEqual(self.invoice.error_message, "10016: CbteFch inválida")
        self.assertIsNone(self.invoice.invoice_number)


@unittest.skipUnless(
    os.environ.get("ARCA_INTEGRATION_TESTS"), "Definir ARCA_INTEGRATION_TESTS=1 para usar ARCA"
)
@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class ARCAHomologacionTests(TestCase):
    """Emite contra el ambiente de homologación de ARCA con el certificado configurado."""

    def test_create_voucher(self):
        # Consumidor final: el CUIT de prueba es el del emisor y ARCA lo rechaza como receptor.
        customer = Customer.objects.create(name="Jerry", email="jerry@example.com")
        invoice = Invoice.objects.create(
            order=Order.objects.create(customer=customer),
            point_of_sale=1,
            invoice_type=CbteTipo.FACTURA_C,
            net_amount=121,
            vat_amount=0,
            total_amount=121,
        )

        response = ARCAElectronicInvoicingAdapter(wsfe=get_wsfe()).create_voucher(invoice)

        self.assertEqual(len(response.cae), 14)
        self.assertGreater(response.numero, 0)
