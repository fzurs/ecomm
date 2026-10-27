import os
import tempfile
import unittest
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal
from types import SimpleNamespace
from unittest import mock

from arca_client import (
    AccessTicket,
    Alicuota,
    CbteTipo,
    CondicionIVAReceptor,
    DocTipo,
    WSFEConnectionError,
    WSFEError,
    neto_por_alicuota,
)
from arca_client.wsfe import Mensaje
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.cache.backends.locmem import LocMemCache
from django.test import SimpleTestCase, TestCase, override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from orders.models import Customer, Order
from store.models import Product, VatRate

from . import amounts, services
from .arca import DjangoTicketCache, get_wsfe
from .models import Invoice, VoucherType
from .pdf import invoice_pdf
from .rules import InvoicingError, UnsupportedVoucher, invoice_letter, receptor_for
from .sample import SampleWSFE

User = get_user_model()

# Fictitious, with a valid check digit.
CUIT = '20123456786'
# What the PDF prints of the issuer; the homologation tests use the certificate's CUIT.
PDF_ISSUER = dict(
    ARCA_ISSUER_LEGAL_NAME='Ecomm SRL',
    ARCA_ISSUER_ADDRESS='Calle Falsa 123, CABA',
    ARCA_ISSUER_ACTIVITY_START='2020-01-01',
    ARCA_ISSUER_GROSS_INCOME='Exento',
)
ISSUER = dict(ARCA_CUIT='20111111112', **PDF_ISSUER)


class FakeWSFE(SampleWSFE):
    def __init__(self):
        super().__init__(today=date(2026, 10, 26))
        self.observations = [Mensaje(10217, 'Observación de prueba')]


def line(unit_price, quantity=1, vat_rate=VatRate.VAT_21, description='Item'):
    unit_price = Decimal(unit_price)
    return SimpleNamespace(
        description=description, quantity=quantity, unit_price=unit_price, vat_rate=vat_rate,
        subtotal=unit_price * quantity,
    )


class AmountsTests(SimpleTestCase):
    def test_net_and_vat_add_up_to_the_charged_price(self):
        result = amounts.estimate([line(16650, 2)], 'B')

        self.assertEqual(result['net_amount'], Decimal('27520.66'))
        self.assertEqual(result['vat_amount'], Decimal('5779.34'))
        self.assertEqual(result['total_amount'], Decimal('33300.00'))

    def test_rates_exempt_and_non_taxed_go_apart(self):
        lines = [
            line(1210, 3), line(1105, 2, VatRate.VAT_10_5),
            line(500, 1, VatRate.EXEMPT), line(300, 2, VatRate.NON_TAXED),
        ]

        result = amounts.voucher_amounts(lines, 'A')

        self.assertEqual(result['neto'], {Alicuota.IVA_10_5: Decimal('2000.00'), Alicuota.IVA_21: Decimal('3000.00')})
        self.assertEqual(result['exento'], Decimal('500'))
        self.assertEqual(result['no_gravado'], Decimal('600'))
        self.assertEqual(amounts.estimate(lines, 'A')['total_amount'], Decimal('6940.00'))

    def test_items_match_the_amounts_sent(self):
        # Each line rounds its net amount: the last one of the rate absorbs the difference.
        lines = [line(18500, 3), line(9800, 7), line(333, 1)]

        items = amounts.to_items(lines, 'B')

        self.assertEqual(neto_por_alicuota(items), amounts.voucher_amounts(lines, 'B')['neto'])
        self.assertEqual(amounts.estimate(lines, 'B')['total_amount'], Decimal('124433.00'))

    def test_c_has_no_iva(self):
        lines = [line(1210, 2), line(500, 1, VatRate.EXEMPT)]

        self.assertEqual(amounts.voucher_amounts(lines, 'C'), {'importe_total': Decimal('2920')})
        self.assertTrue(all(item.alicuota is None for item in amounts.to_items(lines, 'C')))


class FixturesMixin:
    def make_customer(self, name='Jerry', **kwargs) -> Customer:
        return Customer.objects.create(name=name, **kwargs)

    def make_order(self, customer=None, status=Order.Status.PAID, items=((12100, 2),)) -> Order:
        """`items` are (price, quantity) or (price, quantity, vat rate); 21% by default."""
        customer = customer or self.make_customer(document_number='')
        return Order.objects.create_with_items(customer=customer, status=status, items=[
            {'product': self.product(price, *rate), 'quantity': quantity}
            for price, quantity, *rate in items
        ])

    def product(self, price, vat_rate=VatRate.VAT_21) -> Product:
        return Product.objects.get_or_create(
            name=f'Product {price} {vat_rate}',
            defaults={'price': price, 'vat_rate': vat_rate, 'status': Product.Status.ACTIVE},
        )[0]

    def registered(self, name='Acme SA'):
        return self.make_customer(
            name, document_type=Customer.DocumentType.CUIT, document_number=CUIT,
            vat_condition=Customer.VatCondition.REGISTERED, legal_name='Acme Sociedad Anónima',
        )


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class RulesTests(FixturesMixin, TestCase):
    def test_registered_customer_gets_a(self):
        customer = self.registered()

        self.assertEqual(invoice_letter(customer), 'A')
        receptor = receptor_for(customer, 'A')
        self.assertEqual(receptor['receptor_document_number'], CUIT)
        self.assertEqual(receptor['receptor_name'], 'Acme Sociedad Anónima')

    def test_final_consumer_gets_b(self):
        customer = self.make_customer(document_type=Customer.DocumentType.DNI, document_number='30123456')

        self.assertEqual(invoice_letter(customer), 'B')
        self.assertEqual(receptor_for(customer, 'B')['receptor_document_type'], 96)

    def test_monotributo_issuer_gets_c(self):
        with self.settings(ARCA_ISSUER_VAT_CONDITION='monotributo'):
            self.assertEqual(invoice_letter(self.registered()), 'C')

    def test_unidentified_final_consumer(self):
        receptor = receptor_for(self.make_customer(document_number=None), 'B')

        self.assertEqual(receptor['receptor_document_type'], 99)
        self.assertEqual(receptor['receptor_document_number'], '')

    def test_passport_is_not_supported(self):
        customer = self.make_customer(document_type=Customer.DocumentType.PASSPORT, document_number='X1234567')

        with self.assertRaisesMessage(InvoicingError, 'Pasaporte'):
            receptor_for(customer, 'B')

    def test_invalid_cuit(self):
        customer = self.make_customer(document_type=Customer.DocumentType.CUIT, document_number='20123456780')

        with self.assertRaisesMessage(InvoicingError, 'not valid'):
            receptor_for(customer, 'B')

    def test_factura_a_needs_cuit(self):
        customer = self.make_customer(
            document_type=Customer.DocumentType.DNI, document_number='30123456',
            vat_condition=Customer.VatCondition.REGISTERED)

        with self.assertRaisesMessage(InvoicingError, 'CUIT'):
            receptor_for(customer, 'A')


@override_settings(MEDIA_ROOT=tempfile.mkdtemp(), **ISSUER)
class InvoiceAPITests(FixturesMixin, APITestCase):
    def setUp(self):
        self.client.force_login(User.objects.create(username='admin'))
        self.wsfe = FakeWSFE()
        patcher = mock.patch('billing.services.get_wsfe', return_value=self.wsfe)
        patcher.start()
        self.addCleanup(patcher.stop)

    def create(self, order):
        return self.client.post(reverse('invoice-list'), {'order': order.pk}, format='json')

    def invoice(self, customer=None, **kwargs) -> Invoice:
        response = self.create(self.make_order(customer, **kwargs))
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.json())
        return Invoice.objects.get(pk=response.json()['id'])

    def test_creates_and_emits_factura_b(self):
        response = self.create(self.make_order())

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        data = response.json()
        self.assertEqual(data['status'], 'authorized')
        self.assertEqual(data['voucher_type'], VoucherType.INVOICE_B)
        self.assertEqual(data['display_number'], '00001-00000001')
        self.assertEqual(data['total_amount'], '24200.00')
        self.assertEqual(data['vat'], [{'rate': VatRate.VAT_21, 'base': '20000.00', 'amount': '4200.00'}])
        self.assertEqual(data['observations'], [{'code': 10217, 'msg': 'Observación de prueba'}])
        self.assertEqual(data['cae_expiration_date'], '2026-11-05')
        self.assertEqual(len(data['lines']), 1)
        name, kwargs = self.wsfe.calls[0]
        self.assertEqual(name, 'create_invoice_b')
        self.assertEqual(kwargs['doc_tipo'], DocTipo.CONSUMIDOR_FINAL)
        self.assertEqual(kwargs['condicion_iva_receptor'], CondicionIVAReceptor.CONSUMIDOR_FINAL)

    def test_creates_factura_a_for_a_registered_customer(self):
        invoice = self.invoice(self.registered())

        self.assertEqual(invoice.type, VoucherType.INVOICE_A)
        name, kwargs = self.wsfe.calls[0]
        self.assertEqual(name, 'create_invoice_a')
        self.assertEqual(kwargs['doc_nro'], int(CUIT))
        self.assertEqual(kwargs['condicion_iva_receptor'], CondicionIVAReceptor.IVA_RESPONSABLE_INSCRIPTO)
        self.assertEqual(kwargs['neto'], {Alicuota.IVA_21: Decimal('20000.00')})
        self.assertNotIn('doc_tipo', kwargs)

    @override_settings(ARCA_ISSUER_VAT_CONDITION='monotributo')
    def test_creates_factura_c(self):
        invoice = self.invoice()

        self.assertEqual(invoice.type, VoucherType.INVOICE_C)
        self.assertEqual(self.wsfe.calls[0][1]['importe_total'], Decimal('24200'))
        self.assertEqual(invoice.vat_amount, 0)

    def test_order_must_be_paid(self):
        response = self.create(self.make_order(status=Order.Status.PENDING))

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('paid', response.json()['detail'])

    def test_order_is_invoiced_once(self):
        invoice = self.invoice()

        response = self.create(invoice.order)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(len(self.wsfe.calls), 1)

    def test_preview_does_not_emit(self):
        order = self.make_order(self.registered())

        response = self.client.post(reverse('invoice-preview'), {'order': order.pk}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['voucher_type'], VoucherType.INVOICE_A)
        self.assertEqual(response.json()['total_amount'], '24200.00')
        self.assertEqual(self.wsfe.calls, [])
        self.assertFalse(Invoice.objects.exists())

    def test_rejected_invoice_is_retried_in_place(self):
        self.wsfe.error = WSFEError([Mensaje(10015, 'DocNro inválido')])
        response = self.create(self.make_order())
        self.assertEqual(response.json()['status'], 'rejected')
        self.assertEqual(response.json()['arca_errors'], [{'code': 10015, 'msg': 'DocNro inválido'}])

        self.wsfe.error = None
        response = self.client.post(reverse('invoice-emit', args=[response.json()['id']]))

        self.assertEqual(response.json()['status'], 'authorized')
        self.assertEqual(response.json()['arca_errors'], [])
        self.assertEqual(Invoice.objects.count(), 1)

    def test_local_validation_error_rejects(self):
        self.wsfe.error = ValueError('CUIT del receptor inválido')

        data = self.create(self.make_order()).json()

        self.assertEqual(data['status'], 'rejected')
        self.assertEqual(data['error_message'], 'CUIT del receptor inválido')

    def test_connection_drop_safe_to_retry_rejects(self):
        self.wsfe.error = WSFEConnectionError(
            'Sin respuesta', punto_venta=1, tipo=CbteTipo.FACTURA_B, numero=1, safe_to_retry=True)

        self.assertEqual(self.create(self.make_order()).json()['status'], 'rejected')

    def test_unverified_voucher_is_only_verified(self):
        self.wsfe.error = WSFEConnectionError(
            'Sin respuesta', punto_venta=1, tipo=CbteTipo.FACTURA_B, numero=1, safe_to_retry=False)
        data = self.create(self.make_order()).json()
        self.assertEqual(data['status'], 'unverified')
        self.assertEqual(data['number'], 1)

        response = self.client.post(reverse('invoice-emit', args=[data['id']]))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # ARCA authorized it before the connection dropped.
        self.wsfe.error = None
        invoice = Invoice.objects.get(pk=data['id'])
        lines = list(invoice.lines.all())
        self.wsfe.emit(CbteTipo.FACTURA_B, 1, **amounts.voucher_amounts(lines, 'B'), doc_tipo=DocTipo.CONSUMIDOR_FINAL,
                       doc_nro=0, condicion_iva_receptor=CondicionIVAReceptor.CONSUMIDOR_FINAL)

        response = self.client.post(reverse('invoice-verify', args=[data['id']]))

        self.assertEqual(response.json()['status'], 'authorized')
        self.assertEqual(response.json()['cae'], '70001060000001')

    def test_verify_without_voucher_in_arca_rejects(self):
        self.wsfe.error = WSFEConnectionError(
            'Sin respuesta', punto_venta=1, tipo=CbteTipo.FACTURA_B, numero=1, safe_to_retry=False)
        data = self.create(self.make_order()).json()

        response = self.client.post(reverse('invoice-verify', args=[data['id']]))

        self.assertEqual(response.json()['status'], 'rejected')
        self.assertIsNone(response.json()['number'])

    def test_unverified_number_taken_by_a_later_voucher(self):
        # The connection dropped and ARCA never got it: the next B takes its number.
        self.wsfe.fail = 'unverified'
        lost = self.create(self.make_order()).json()
        self.wsfe.fail = None
        later = self.invoice(self.make_customer('Tom', document_number=''))
        self.assertEqual((lost['number'], later.number), (1, 1))

        response = self.client.post(reverse('invoice-verify', args=[lost['id']]))

        self.assertEqual(response.json()['status'], 'rejected')
        self.assertIn('with its number', response.json()['error_message'])
        response = self.client.post(reverse('invoice-emit', args=[lost['id']]))
        self.assertEqual(response.json()['display_number'], '00001-00000002')

    def test_full_credit_note(self):
        invoice = self.invoice(self.registered())

        response = self.client.post(reverse('invoice-credit-note', args=[invoice.pk]), {}, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.json())
        data = response.json()
        self.assertEqual(data['voucher_type'], VoucherType.CREDIT_NOTE_A)
        self.assertEqual(data['associated_invoice']['id'], invoice.pk)
        self.assertEqual(data['total_amount'], '24200.00')
        name, kwargs = self.wsfe.calls[1]
        self.assertEqual(name, 'create_credit_note_a')
        self.assertEqual(kwargs['asociado'].tipo, CbteTipo.FACTURA_A)
        self.assertEqual(kwargs['asociado'].numero, invoice.number)
        self.assertEqual(kwargs['asociado'].fecha, invoice.issue_date)
        detail = self.client.get(reverse('invoice-detail', args=[invoice.pk])).json()
        self.assertEqual(detail['credit_available'], '0.00')
        self.assertEqual(len(detail['notes']), 1)

    def test_partial_credit_note_and_over_credit(self):
        invoice = self.invoice(self.registered())
        line = invoice.lines.get()
        url = reverse('invoice-credit-note', args=[invoice.pk])

        response = self.client.post(url, {'lines': [{'line': line.pk, 'quantity': 1}]}, format='json')
        self.assertEqual(response.json()['total_amount'], '12100.00')

        response = self.client.post(url, {'lines': [{'line': line.pk, 'quantity': 2}]}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('at most 1', response.json()['detail'])
        detail = self.client.get(reverse('invoice-detail', args=[invoice.pk])).json()
        self.assertEqual(detail['lines'][0]['credited_quantity'], 1)
        self.assertEqual(detail['credit_available'], '12100.00')

    def test_debit_note(self):
        invoice = self.invoice(self.registered())
        lines = [{'description': 'Intereses', 'quantity': 1, 'unit_price': '1210.00', 'vat_rate': VatRate.VAT_21}]

        response = self.client.post(reverse('invoice-debit-note', args=[invoice.pk]), {'lines': lines}, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.json())
        self.assertEqual(response.json()['voucher_type'], VoucherType.DEBIT_NOTE_A)
        self.assertEqual(response.json()['net_amount'], '1000.00')
        self.assertEqual(self.wsfe.calls[1][0], 'create_debit_note_a')

    def test_b_notes_are_not_supported_yet(self):
        invoice = self.invoice()

        response = self.client.post(reverse('invoice-credit-note', args=[invoice.pk]), {}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('arca-client', response.json()['detail'])
        detail = self.client.get(reverse('invoice-detail', args=[invoice.pk])).json()
        self.assertIn('arca-client', detail['notes_unavailable_reason'])
        with self.assertRaises(UnsupportedVoucher):
            services.build_debit_note(invoice, [])

    def test_pdf(self):
        invoice = self.invoice(self.registered(), items=((12100, 2), (9999, 3)))

        response = self.client.get(reverse('invoice-pdf', args=[invoice.pk]))

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'application/pdf')
        self.assertTrue(response.content.startswith(b'%PDF'))

    def test_pdf_of_a_credit_note(self):
        invoice = self.invoice(self.registered())
        note = services.create_credit_note(invoice)

        response = self.client.get(reverse('invoice-pdf', args=[note.pk]))

        self.assertTrue(response.content.startswith(b'%PDF'))

    @override_settings(ARCA_ISSUER_LEGAL_NAME='')
    def test_pdf_needs_the_issuer(self):
        invoice = self.invoice()

        response = self.client.get(reverse('invoice-pdf', args=[invoice.pk]))

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('ARCA_ISSUER_LEGAL_NAME', response.json()['detail'])

    def test_only_rejected_vouchers_are_deleted(self):
        invoice = self.invoice()
        response = self.client.delete(reverse('invoice-detail', args=[invoice.pk]))
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        Invoice.objects.filter(pk=invoice.pk).update(status=Invoice.Status.REJECTED)
        response = self.client.delete(reverse('invoice-detail', args=[invoice.pk]))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_filters(self):
        invoice = self.invoice(self.registered())
        services.create_credit_note(invoice)
        self.invoice()

        def ids(**params):
            return [row['id'] for row in self.client.get(reverse('invoice-list'), params).json()['results']]

        self.assertEqual(len(ids(kind='credit_note')), 1)
        self.assertEqual(len(ids(voucher_type=[VoucherType.INVOICE_A, VoucherType.INVOICE_B])), 2)
        self.assertEqual(ids(order=invoice.order_id, kind='invoice'), [invoice.pk])


class OrderStatusLockTests(FixturesMixin, APITestCase):
    """What an order's invoice says about the statuses it can move to (`order_status_locks`)."""

    def setUp(self):
        self.client.force_login(User.objects.create(username='admin'))
        patcher = mock.patch('billing.services.get_wsfe', return_value=FakeWSFE())
        patcher.start()
        self.addCleanup(patcher.stop)

    def set_status(self, order, new_status):
        return self.client.patch(
            reverse('order-detail', args=[order.number]), {'status': new_status}, format='json')

    def locks(self, order):
        response = self.client.get(reverse('order-detail', args=[order.number]))
        return {lock['status']: lock['reason'] for lock in response.json()['status_locks']}

    def test_an_invoiced_order_keeps_moving_forward(self):
        order = services.create_invoice(self.make_order()).order
        for new_status in ('shipped', 'delivered', 'paid'):
            with self.subTest(new_status=new_status):
                response = self.set_status(order, new_status)
                self.assertEqual(response.status_code, status.HTTP_200_OK, response.json())

    def test_an_invoiced_order_cant_go_back_to_pending_or_be_cancelled(self):
        order = services.create_invoice(self.make_order()).order
        self.assertEqual(set(self.locks(order)), {'pending', 'cancelled'})
        for new_status in ('pending', 'cancelled'):
            with self.subTest(new_status=new_status):
                response = self.set_status(order, new_status)
                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
                self.assertEqual(response.json()['status'], [self.locks(order)[new_status]])
        order.refresh_from_db()
        self.assertEqual(order.status, Order.Status.PAID)

    def test_a_rejected_invoice_locks_nothing(self):
        order = self.make_order()
        services.reject(services.save_draft(*services.build_invoice(order)), 'Rejected')
        self.assertEqual(self.locks(order), {})
        self.assertEqual(self.set_status(order, 'cancelled').status_code, status.HTTP_200_OK)

    def test_a_fully_credited_order_can_be_cancelled_but_not_unpaid(self):
        invoice = services.create_invoice(self.make_order(self.registered(), items=((100, 2),)))
        line = invoice.lines.get()
        services.create_credit_note(invoice, [(line, 1)])
        self.assertIn('cancelled', self.locks(invoice.order))

        services.create_credit_note(invoice)
        self.assertEqual(set(self.locks(invoice.order)), {'pending'})
        response = self.set_status(invoice.order, 'cancelled')
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.json())

    def test_an_invoiced_order_cant_be_deleted(self):
        invoice = services.create_invoice(self.make_order(self.registered()))
        services.create_credit_note(invoice)
        order = invoice.order
        detail = self.client.get(reverse('order-detail', args=[order.number])).json()
        self.assertIsNotNone(detail['delete_lock'])

        response = self.client.delete(reverse('order-detail', args=[order.number]))

        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(response.json()['detail'], detail['delete_lock'])
        self.assertTrue(Order.objects.filter(pk=order.pk).exists())

    def test_deleting_an_order_deletes_its_rejected_invoices(self):
        order = self.make_order()
        rejected = services.reject(services.save_draft(*services.build_invoice(order)), 'Rejected')
        detail = self.client.get(reverse('order-detail', args=[order.number])).json()
        self.assertIsNone(detail['delete_lock'])

        response = self.client.delete(reverse('order-detail', args=[order.number]))

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Order.objects.filter(pk=order.pk).exists())
        self.assertFalse(Invoice.objects.filter(pk=rejected.pk).exists())

    def test_a_shipped_order_can_be_invoiced(self):
        order = self.make_order(status=Order.Status.SHIPPED)
        response = self.client.get(reverse('order-list'), {'invoice_status': ['to_invoice']})
        self.assertEqual([o['number'] for o in response.json()['results']], [order.number])
        self.assertEqual(services.create_invoice(order).status, Invoice.Status.AUTHORIZED)


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


@unittest.skipUnless(
    os.environ.get("ARCA_INTEGRATION_TESTS"), "Definir ARCA_INTEGRATION_TESTS=1 para usar ARCA"
)
@override_settings(MEDIA_ROOT=tempfile.mkdtemp(), **PDF_ISSUER)
class ARCAHomologacionTests(FixturesMixin, TestCase):
    """Emite contra el ambiente de homologación de ARCA con el certificado configurado.

    Cada corrida consume numeración: 6 comprobantes (Factura B x2, Factura A, Nota de Crédito A,
    Nota de Débito A y Factura C). Las consultas (`verify`) no emiten nada.
    """

    # Ficticia, con dígito verificador válido. No puede ser la del emisor: ARCA la rechaza como
    # receptor. Otra con ARCA_TEST_RECEPTOR_CUIT si homologación la rechazara.
    RECEPTOR_CUIT = os.environ.get("ARCA_TEST_RECEPTOR_CUIT", CUIT)

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        get_wsfe.cache_clear()

    def assertAuthorized(self, voucher: Invoice, voucher_type: VoucherType):
        self.assertEqual(voucher.status, Invoice.Status.AUTHORIZED, voucher.error_message)
        self.assertEqual(voucher.type, voucher_type)
        self.assertEqual(len(voucher.cae), 14)
        self.assertGreater(voucher.number, 0)
        self.assertGreaterEqual(voucher.cae_expiration_date, voucher.issue_date)
        # The PDF checks its items against what ARCA authorized.
        self.assertTrue(invoice_pdf(voucher).startswith(b'%PDF'))

    def test_factura_b_to_unidentified_final_consumer(self):
        order = self.make_order(items=((16650, 2), (9800, 1, VatRate.VAT_10_5)))

        invoice = services.create_invoice(order)

        self.assertAuthorized(invoice, VoucherType.INVOICE_B)
        self.assertEqual(invoice.receptor_document_type, 99)
        self.assertEqual(invoice.total_amount, Decimal('43100.00'))
        self.assertEqual(
            sorted(invoice.vat.values_list('rate', flat=True)), [VatRate.VAT_10_5, VatRate.VAT_21])

    def test_factura_b_to_identified_final_consumer(self):
        customer = self.make_customer(document_type=Customer.DocumentType.DNI, document_number='30123456')

        invoice = services.create_invoice(self.make_order(customer))

        self.assertAuthorized(invoice, VoucherType.INVOICE_B)
        self.assertEqual(invoice.arca_response['doc_tipo'], DocTipo.DNI)
        self.assertEqual(invoice.arca_response['doc_nro'], 30123456)

    def test_factura_a_with_credit_and_debit_notes(self):
        customer = self.make_customer(
            'Receptor A', document_type=Customer.DocumentType.CUIT,
            document_number=self.RECEPTOR_CUIT, vat_condition=Customer.VatCondition.REGISTERED,
            address='Av. Siempre Viva 742')
        order = self.make_order(customer, items=(
            (12100, 3), (11050, 2, VatRate.VAT_10_5), (5000, 1, VatRate.EXEMPT)))

        invoice = services.create_invoice(order)

        self.assertAuthorized(invoice, VoucherType.INVOICE_A)
        self.assertEqual(invoice.net_amount, Decimal('50000.00'))
        self.assertEqual(invoice.vat_amount, Decimal('8400.00'))
        self.assertEqual(invoice.exempt_amount, Decimal('5000.00'))
        self.assertEqual(invoice.total_amount, Decimal('63400.00'))

        # Partial: one unit of the first line.
        line = invoice.lines.get(vat_rate=VatRate.VAT_21)
        credit = services.create_credit_note(invoice, [(line, 1)])

        self.assertAuthorized(credit, VoucherType.CREDIT_NOTE_A)
        self.assertEqual(credit.total_amount, Decimal('12100.00'))
        associated = credit.arca_response['asociados'][0]
        self.assertEqual((associated['tipo'], associated['numero']), (VoucherType.INVOICE_A, invoice.number))
        self.assertEqual(services.credit_available(invoice), Decimal('51300.00'))

        debit = services.create_debit_note(invoice, [{
            'description': 'Intereses por pago fuera de término', 'quantity': 1,
            'unit_price': Decimal('1210.00'), 'vat_rate': VatRate.VAT_21,
        }])

        self.assertAuthorized(debit, VoucherType.DEBIT_NOTE_A)
        self.assertEqual(debit.net_amount, Decimal('1000.00'))
        self.assertEqual(debit.vat_amount, Decimal('210.00'))

    @override_settings(ARCA_ISSUER_VAT_CONDITION='monotributo')
    def test_factura_c(self):
        invoice = services.create_invoice(self.make_order(items=((12100, 2), (5000, 1, VatRate.EXEMPT))))

        self.assertAuthorized(invoice, VoucherType.INVOICE_C)
        self.assertEqual(invoice.total_amount, Decimal('29200.00'))
        self.assertEqual(invoice.vat_amount, 0)
        self.assertFalse(invoice.vat.exists())

    def test_verify(self):
        """Asks ARCA for vouchers without emitting: the last authorized B, and one that doesn't
        exist yet."""
        wsfe = get_wsfe()
        last = wsfe.last_voucher_number(settings.ARCA_POINT_OF_SALE, CbteTipo.FACTURA_B)
        if not last:
            self.skipTest('There is no Factura B in homologación yet')
        voucher = wsfe.get_voucher(settings.ARCA_POINT_OF_SALE, CbteTipo.FACTURA_B, last)

        invoice = services.verify(self.unverified(last, voucher))

        self.assertEqual(invoice.status, Invoice.Status.AUTHORIZED)
        self.assertEqual(invoice.cae, voucher.cae)

        missing = services.verify(self.unverified(last + 1000, voucher))

        self.assertEqual(missing.status, Invoice.Status.REJECTED)
        self.assertIsNone(missing.number)

    def unverified(self, number, voucher) -> Invoice:
        """A Factura B left unverified with `number`, with the data `verify` compares."""
        customer = self.make_customer(f'Jerry {number}', document_number='')
        invoice, lines = services.build_invoice(self.make_order(customer))
        invoice.number = number
        invoice.total_amount = voucher.importe_total
        invoice.receptor_document_number = str(voucher.doc_nro or '')
        services.save_draft(invoice, lines)
        Invoice.objects.filter(pk=invoice.pk).update(status=Invoice.Status.UNVERIFIED)
        return invoice
