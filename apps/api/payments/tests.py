import hashlib
import hmac
import io
import tempfile
from datetime import timedelta
from unittest import mock

from django.core import mail
from django.core.cache import cache
from django.core.management import call_command
from django.test import SimpleTestCase, TestCase, override_settings
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from billing.models import Invoice
from billing.sample import SAMPLE_POINT_OF_SALE
from orders.models import Customer, Order
from store.models import Product

from . import gateway
from .models import Payment

CHECKOUT = {
    'name': 'Ana Pérez',
    'email': 'ana@example.com',
    'document_type': Customer.DocumentType.DNI,
    'document_number': '30111222',
    'vat_condition': Customer.VatCondition.FINAL_CONSUMER,
    'shipping_address': 'Av. Siempre Viva 742, CABA',
}
ISSUER = {
    'ARCA_ISSUER_LEGAL_NAME': 'Acme SA',
    'ARCA_ISSUER_ADDRESS': 'Calle Falsa 123',
    'ARCA_ISSUER_ACTIVITY_START': '2020-01-01',
    'ARCA_ISSUER_GROSS_INCOME': '901-123456-7',
}


def mp_payment(order, payment_id=111, status='approved', amount=None, currency='ARS', detail='accredited'):
    """A payment as Mercado Pago's API returns it."""
    return {
        'id': payment_id,
        'status': status,
        'status_detail': detail,
        'transaction_amount': float(order.total if amount is None else amount),
        'currency_id': currency,
        'external_reference': order.number,
    }


@override_settings(MEDIA_ROOT=tempfile.mkdtemp(), AUTO_INVOICE='sample', MERCADOPAGO_WEBHOOK_SECRET='',
                   MERCADOPAGO_ACCESS_TOKEN='TEST-token')
class PaymentTestCase(APITestCase):
    """Orders placed through the store's checkout, with Mercado Pago mocked (payments.gateway)."""

    def setUp(self):
        cache.clear()
        self.product = Product.objects.create(name='ACME Hammer', price=1000, status=Product.Status.ACTIVE)
        preference = mock.patch.object(
            gateway, 'create_preference', side_effect=lambda order: (f'pref-{order.pk}', f'https://mp.test/{order.number}'))
        self.create_preference = preference.start()
        self.addCleanup(preference.stop)

    def place_order(self, client=None, **data):
        client = client or self.client
        client.post(reverse('cart-items'), {'product': self.product.pk, 'quantity': 2}, format='json')
        response = client.post(reverse('checkout'), {**CHECKOUT, **data}, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.content)
        return Order.objects.get(number=response.json()['number']), response.json()

    def notify(self, payment, **query):
        with mock.patch.object(gateway, 'get_payment', return_value=payment), \
                self.captureOnCommitCallbacks(execute=True):
            return APIClient().post(
                f"{reverse('mercadopago-webhook')}?data.id={payment['id']}&type=payment",
                {'type': 'payment', 'data': {'id': str(payment['id'])}}, format='json', **query)


class CheckoutPaymentTests(PaymentTestCase):
    def test_the_checkout_answers_mercado_pagos_link(self):
        order, result = self.place_order()
        self.assertEqual(result['payment_url'], f'https://mp.test/{order.number}')
        payment = order.payments.get()
        self.assertEqual((payment.status, payment.preference_id, payment.amount),
                         (Payment.Status.CREATED, f'pref-{order.pk}', 2000))

    def test_without_mercado_pago_the_order_is_placed_anyway(self):
        self.create_preference.side_effect = gateway.GatewayError('down')
        with self.assertLogs('billing', 'ERROR'):
            order, result = self.place_order()
        self.assertIsNone(result['payment_url'])
        self.assertEqual(order.status, Order.Status.PENDING)

    def test_the_billing_data_has_to_be_enough_for_the_invoice(self):
        self.client.post(reverse('cart-items'), {'product': self.product.pk}, format='json')
        response = self.client.post(reverse('checkout'), {
            **CHECKOUT, 'document_type': Customer.DocumentType.PASSPORT, 'document_number': 'AB123456',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('document_number', response.json())


class WebhookTests(PaymentTestCase):
    def test_an_approved_payment_pays_and_invoices_the_order(self):
        order, _ = self.place_order()
        mail.outbox.clear()
        self.assertEqual(self.notify(mp_payment(order)).status_code, status.HTTP_200_OK)

        order.refresh_from_db()
        self.assertEqual(order.status, Order.Status.PAID)
        payment = order.payments.get()
        self.assertEqual((payment.status, payment.provider_payment_id), (Payment.Status.APPROVED, '111'))
        # dev: a made-up voucher on the sample point of sale, never ARCA.
        invoice = order.invoices.get()
        self.assertEqual((invoice.status, invoice.point_of_sale), (Invoice.Status.AUTHORIZED, SAMPLE_POINT_OF_SALE))
        [message] = mail.outbox
        self.assertIn('Payment received', message.subject)
        self.assertEqual(message.to, ['ana@example.com'])

    def test_the_same_notification_again_changes_nothing(self):
        order, _ = self.place_order()
        self.notify(mp_payment(order))
        self.notify(mp_payment(order))
        self.assertEqual(order.payments.count(), 1)
        self.assertEqual(order.invoices.count(), 1)

    def test_sample_vouchers_number_after_the_last_one(self):
        first, _ = self.place_order()
        second, _ = self.place_order(APIClient())
        self.notify(mp_payment(first, payment_id=1))
        self.notify(mp_payment(second, payment_id=2))
        self.assertEqual(sorted(Invoice.objects.values_list('number', flat=True)), [1, 2])

    def test_a_payment_that_doesnt_match_the_order_doesnt_pay_it(self):
        order, _ = self.place_order()
        for payment in [mp_payment(order, amount=1), mp_payment(order, currency='USD')]:
            with self.subTest(payment), self.assertLogs('billing', 'CRITICAL'):
                self.notify(payment)
        order.refresh_from_db()
        self.assertEqual(order.status, Order.Status.PENDING)

    def test_cash_waits_and_then_pays(self):
        order, _ = self.place_order()
        self.notify(mp_payment(order, status='pending', detail='pending_waiting_payment'))
        order.refresh_from_db()
        self.assertEqual(order.status, Order.Status.PENDING)
        self.notify(mp_payment(order))
        order.refresh_from_db()
        self.assertEqual(order.status, Order.Status.PAID)

    def test_a_rejected_payment_can_be_tried_again(self):
        order, _ = self.place_order()
        self.notify(mp_payment(order, status='rejected', detail='cc_rejected_insufficient_amount'))
        order.refresh_from_db()
        self.assertEqual(order.status, Order.Status.PENDING)
        detail = self.client.get(reverse('my-order-detail', args=[order.number])).json()
        self.assertEqual((detail['payment_status'], detail['payment_status_detail']),
                         ('rejected', 'cc_rejected_insufficient_amount'))

        response = self.client.post(reverse('my-order-pay', args=[order.number]))
        self.assertEqual(response.json()['payment_url'], f'https://mp.test/{order.number}')
        self.notify(mp_payment(order, payment_id=222))
        order.refresh_from_db()
        self.assertEqual(order.status, Order.Status.PAID)
        self.assertEqual(order.payments.count(), 2)

    def test_unknown_payments_and_orders_are_acknowledged(self):
        order, _ = self.place_order()
        with mock.patch.object(gateway, 'get_payment', return_value=None):
            response = APIClient().post(f"{reverse('mercadopago-webhook')}?data.id=9&type=payment")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        with self.assertLogs('billing', 'WARNING'):
            response = self.notify({**mp_payment(order), 'external_reference': 'ORD-999999'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Other topics aren't needed.
        response = APIClient().post(f"{reverse('mercadopago-webhook')}?id=5&topic=merchant_order")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_mercado_pago_down_asks_it_to_retry(self):
        with mock.patch.object(gateway, 'get_payment', side_effect=gateway.GatewayError('down')), \
                self.assertLogs('billing', 'ERROR'):
            response = APIClient().post(f"{reverse('mercadopago-webhook')}?data.id=9&type=payment")
        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)

    @override_settings(MERCADOPAGO_WEBHOOK_SECRET='secreto')
    def test_the_signature_is_checked(self):
        order, _ = self.place_order()
        payment = mp_payment(order)
        ts = '1704908010'
        manifest = f'id:111;request-id:req-1;ts:{ts};'
        v1 = hmac.new(b'secreto', manifest.encode(), hashlib.sha256).hexdigest()

        with self.assertLogs('billing', 'WARNING'):
            response = self.notify(payment, HTTP_X_SIGNATURE=f'ts={ts},v1={"0" * 64}', HTTP_X_REQUEST_ID='req-1')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        response = self.notify(payment, HTTP_X_SIGNATURE=f'ts={ts},v1={v1}', HTTP_X_REQUEST_ID='req-1')
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class MyOrderPaymentTests(PaymentTestCase):
    def test_only_a_pending_order_without_a_payment_in_process_can_be_paid(self):
        order, _ = self.place_order()
        self.notify(mp_payment(order, status='in_process'))
        self.assertEqual(self.client.post(reverse('my-order-pay', args=[order.number])).status_code,
                         status.HTTP_409_CONFLICT)
        self.notify(mp_payment(order))
        self.assertEqual(self.client.post(reverse('my-order-pay', args=[order.number])).status_code,
                         status.HTTP_409_CONFLICT)

    def test_nobody_else_pays_it_or_sees_its_invoice(self):
        order, _ = self.place_order()
        other = APIClient()
        self.assertEqual(other.post(reverse('my-order-pay', args=[order.number])).status_code,
                         status.HTTP_404_NOT_FOUND)
        self.assertEqual(other.get(reverse('my-order-invoice', args=[order.number])).status_code,
                         status.HTTP_404_NOT_FOUND)

    @override_settings(**ISSUER)
    def test_the_customer_downloads_the_invoice(self):
        order, _ = self.place_order()
        url = reverse('my-order-invoice', args=[order.number])
        self.assertEqual(self.client.get(url).status_code, status.HTTP_404_NOT_FOUND)
        self.notify(mp_payment(order))

        self.assertTrue(self.client.get(reverse('my-order-detail', args=[order.number])).json()['has_invoice'])
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'application/pdf')
        # And it went with the mail.
        self.assertEqual(mail.outbox[-1].attachments[0][2], 'application/pdf')


class CommandTests(PaymentTestCase):
    def test_unpaid_orders_are_cancelled_after_a_while(self):
        unpaid, _ = self.place_order()
        cash, _ = self.place_order(APIClient())
        self.notify(mp_payment(cash, status='pending'))
        recent, _ = self.place_order(APIClient())
        # By hand in the admin: no payment link, not the store's.
        by_hand = Order.objects.create(customer=unpaid.customer)
        old = timezone.now() - timedelta(hours=73)
        Order.objects.exclude(pk=recent.pk).update(created_at=old)

        call_command('cancel_unpaid_orders', stdout=io.StringIO())
        statuses = dict(Order.objects.values_list('number', 'status'))
        self.assertEqual(statuses[unpaid.number], Order.Status.CANCELLED)
        self.assertEqual(statuses[cash.number], Order.Status.PENDING)
        self.assertEqual(statuses[recent.number], Order.Status.PENDING)
        self.assertEqual(statuses[by_hand.number], Order.Status.PENDING)

    def test_paid_orders_left_without_an_invoice_get_one(self):
        order, _ = self.place_order()
        with override_settings(AUTO_INVOICE='off'):
            self.notify(mp_payment(order))
        self.assertFalse(order.invoices.exists())
        call_command('invoice_paid_orders', stdout=io.StringIO())
        self.assertEqual(order.invoices.get().status, Invoice.Status.AUTHORIZED)


@override_settings(MEDIA_ROOT=tempfile.mkdtemp(), MERCADOPAGO_ACCESS_TOKEN='TEST-token', MERCADOPAGO_SANDBOX=True,
                   MERCADOPAGO_NOTIFICATION_URL='https://tienda.example.com/api/payments/webhooks/mercadopago/')
class PreferenceTests(TestCase):
    """What the store asks Mercado Pago for (the SDK mocked)."""

    def setUp(self):
        customer = Customer.objects.create(name='Ana', email='ana@example.com')
        product = Product.objects.create(name='ACME Hammer', price=1000, status=Product.Status.ACTIVE)
        self.order = Order.objects.create_with_items(customer=customer, items=[{'product': product, 'quantity': 2}])

    def create(self):
        sdk = mock.MagicMock()
        sdk.preference.return_value.create.return_value = {
            'status': 201, 'response': {'id': 'pref-1', 'init_point': 'https://mp/i', 'sandbox_init_point': 'https://mp/s'}}
        with mock.patch.object(gateway, 'sdk', return_value=sdk):
            result = gateway.create_preference(self.order)
        return result, sdk.preference.return_value.create.call_args.args[0]

    @override_settings(STORE_URL='https://tienda.example.com')
    def test_the_order_and_where_to_come_back(self):
        (preference_id, url), data = self.create()
        self.assertEqual((preference_id, url), ('pref-1', 'https://mp/s'))
        self.assertEqual(data['external_reference'], self.order.number)
        self.assertEqual(data['items'][0]['quantity'], 2)
        self.assertEqual(data['back_urls']['success'], f'https://tienda.example.com/orders/{self.order.number}')
        self.assertEqual(data['auto_return'], 'approved')
        self.assertEqual(data['notification_url'], 'https://tienda.example.com/api/payments/webhooks/mercadopago/')

    @override_settings(STORE_URL='http://localhost:3000',
                       MERCADOPAGO_NOTIFICATION_URL='http://localhost:3000/api/payments/webhooks/mercadopago/')
    def test_in_dev_without_what_mercado_pago_refuses_for_localhost(self):
        _, data = self.create()
        self.assertNotIn('auto_return', data)
        self.assertNotIn('notification_url', data)


class SignatureTests(SimpleTestCase):
    @override_settings(MERCADOPAGO_WEBHOOK_SECRET='secreto')
    def test_mercado_pagos_example(self):
        ts, request_id = '1704908010', 'bb56a2f1-6aae-46ac-982e-9dcd3581d08e'
        manifest = f'id:abc123;request-id:{request_id};ts:{ts};'
        v1 = hmac.new(b'secreto', manifest.encode(), hashlib.sha256).hexdigest()
        # An alphanumeric id goes in lowercase.
        self.assertTrue(gateway.valid_signature(f'ts={ts},v1={v1}', request_id, 'ABC123'))
        self.assertFalse(gateway.valid_signature(f'ts={ts},v1={v1}', request_id, 'other'))
        self.assertFalse(gateway.valid_signature('', request_id, 'ABC123'))

    @override_settings(MERCADOPAGO_WEBHOOK_SECRET='')
    def test_without_a_secret_it_cant_be_checked(self):
        self.assertTrue(gateway.valid_signature('', '', '1'))
