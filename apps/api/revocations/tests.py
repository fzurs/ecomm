import tempfile
from datetime import timedelta
from unittest import mock

from django.core import mail
from django.core.cache import cache
from django.test import override_settings
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from billing.models import Invoice
from config.testing import make_staff
from orders.models import Customer, Order
from payments import gateway
from payments import services as payments
from payments.models import Payment
from store.models import Product

from .models import RevocationRequest


@override_settings(MEDIA_ROOT=tempfile.mkdtemp(), AUTO_INVOICE='sample',
                   STAFF_NOTIFICATION_EMAIL='ventas@example.com')
class RevocationTestCase(APITestCase):
    def setUp(self):
        cache.clear()
        self.product = Product.objects.create(name='ACME Hammer', price=1000, status=Product.Status.ACTIVE, stock=10)
        customer = Customer.objects.create(name='Ana', email='ana@example.com')
        self.order = Order.objects.create_with_items(
            customer=customer, items=[{'product': self.product, 'quantity': 2}], reserve=True)

    def pay(self, order=None):
        """Paid with Mercado Pago and invoiced, as the webhook leaves it."""
        order = order or self.order
        Payment.objects.create(order=order, provider_payment_id='111', status=Payment.Status.APPROVED,
                               amount=order.total)
        Order.objects.filter(pk=order.pk).update(status=Order.Status.PAID)
        payments.invoice_order(order.pk)
        order.refresh_from_db()

    def ask(self, number=None, email='ana@example.com', client=None, **data):
        return (client or APIClient()).post(reverse('revocation-request'), {
            'order_number': number or self.order.number, 'email': email, **data}, format='json')


class RequestTests(RevocationTestCase):
    def test_the_customer_gets_a_code_and_the_staff_a_notice(self):
        self.pay()
        with self.captureOnCommitCallbacks(execute=True):
            response = self.ask(email='ANA@example.com ', reason='Changed my mind')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.json())
        code = response.json()['code']
        self.assertTrue(code.startswith('ARR-'))
        customer, staff = mail.outbox
        self.assertEqual(customer.to, ['ANA@example.com'])
        self.assertIn(code, customer.body)
        self.assertEqual(staff.to, ['ventas@example.com'])
        self.assertIn('Changed my mind', staff.body)

        # One open at a time.
        response = self.ask()
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn(code, response.json()['detail'])

    def test_someone_else_learns_nothing(self):
        self.pay()
        wrong_email = self.ask(email='otro@example.com').json()
        no_order = self.ask(number='ORD-999999').json()
        self.assertEqual(wrong_email, no_order)
        self.assertFalse(RevocationRequest.objects.exists())

    def test_only_paid_orders(self):
        self.assertIn("isn't paid", self.ask().json()['detail'])
        Order.objects.filter(pk=self.order.pk).update(status=Order.Status.CANCELLED)
        self.assertIn('cancelled', self.ask().json()['detail'])

    def test_ten_days_from_the_delivery(self):
        self.pay()
        Order.objects.filter(pk=self.order.pk).update(
            status=Order.Status.DELIVERED, created_at=timezone.now() - timedelta(days=15),
            delivered_at=timezone.now() - timedelta(days=11))
        self.assertIn('ended on', self.ask().json()['detail'])
        Order.objects.filter(pk=self.order.pk).update(delivered_at=timezone.now() - timedelta(days=9))
        self.assertEqual(self.ask().status_code, status.HTTP_201_CREATED)

    def test_guessing_is_throttled(self):
        client = APIClient()
        for _ in range(10):
            self.ask(email='otro@example.com', client=client)
        self.assertEqual(self.ask(client=client).status_code, status.HTTP_429_TOO_MANY_REQUESTS)


    def test_without_the_store_there_is_no_button(self):
        self.pay()
        with override_settings(STORE_ENABLED=False):
            self.assertEqual(self.ask().status_code, status.HTTP_404_NOT_FOUND)
        self.assertFalse(RevocationRequest.objects.exists())
        self.assertEqual(mail.outbox, [])


class ResolveTests(RevocationTestCase):
    def setUp(self):
        super().setUp()
        self.pay()
        self.code = self.ask().json()['code']
        mail.outbox.clear()
        self.client.force_login(make_staff())

    def approve(self, **data):
        with mock.patch.object(gateway, 'refund') as refund:
            response = self.client.post(reverse('revocation-approve', args=[self.code]), data, format='json')
        return response, refund

    def test_approving_refunds_credits_and_cancels(self):
        response, refund = self.approve()
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.json())
        refund.assert_called_once_with('111')
        self.assertEqual((response.json()['status'], response.json()['refund']), ('approved', 'mercadopago'))
        self.order.refresh_from_db()
        self.product.refresh_from_db()
        self.assertEqual(self.order.status, Order.Status.CANCELLED)
        self.assertEqual(self.product.stock, 10)
        note = self.order.invoices.get(associated_invoice__isnull=False)
        self.assertEqual(note.status, Invoice.Status.AUTHORIZED)
        [message] = mail.outbox
        self.assertIn('approved', message.subject)

        # Mercado Pago's `refunded` notification then changes nothing.
        self.assertIsNone(payments.credit_order(self.order.pk))
        # Nor approving again.
        response, refund = self.approve()
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        refund.assert_not_called()

    def test_a_shipped_order_needs_its_goods_back(self):
        Order.objects.filter(pk=self.order.pk).update(status=Order.Status.SHIPPED)
        response, refund = self.approve()
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        refund.assert_not_called()
        response, refund = self.approve(goods_returned=True)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_if_mercado_pago_refuses_nothing_changes(self):
        with mock.patch.object(gateway, 'refund', side_effect=gateway.GatewayError('down')):
            response = self.client.post(reverse('revocation-approve', args=[self.code]), {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
        self.assertEqual(RevocationRequest.objects.get().status, RevocationRequest.Status.REQUESTED)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, Order.Status.PAID)

    def test_rejecting_tells_the_customer_why(self):
        response = self.client.post(reverse('revocation-reject', args=[self.code]), {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        response = self.client.post(
            reverse('revocation-reject', args=[self.code]), {'note': 'Ya pasaron los 10 días.'}, format='json')
        self.assertEqual(response.json()['status'], 'rejected')
        [message] = mail.outbox
        self.assertIn('Ya pasaron los 10 días.', message.body)

    def test_read_only_staff_cant_resolve(self):
        self.client.force_login(make_staff('lector', role='Solo lectura'))
        self.assertEqual(self.client.get(reverse('revocation-list')).json()['count'], 1)
        response, _ = self.approve()
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
