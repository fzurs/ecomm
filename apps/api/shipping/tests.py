import tempfile

from django.core import mail
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from config.testing import make_staff
from orders.models import Customer, Order
from store.models import Product

from .models import ShippingZone


class ShippingZoneTests(APITestCase):
    def setUp(self):
        self.client.force_login(make_staff())
        ShippingZone.objects.create(name='AMBA', provinces=['caba', 'buenos_aires'], cost=1500)

    def test_a_province_is_in_one_zone(self):
        response = self.client.post(reverse('shippingzone-list'), {
            'name': 'Centro', 'provinces': ['cordoba', 'caba'], 'cost': 3000}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Ciudad Autónoma de Buenos Aires (AMBA)', response.json()['provinces'][0])

        response = self.client.post(reverse('shippingzone-list'), {
            'name': 'Centro', 'provinces': ['cordoba', 'santa_fe'], 'cost': 3000, 'free_from': 100000},
            format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.json())
        # Editing a zone keeps its own provinces.
        amba = ShippingZone.objects.get(name='AMBA')
        response = self.client.patch(reverse('shippingzone-detail', args=[amba.pk]), {
            'provinces': ['caba', 'buenos_aires', 'la_pampa']}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.json())

    def test_the_store_reads_the_options(self):
        client = self.client_class()
        self.assertEqual(client.get(reverse('shippingzone-list')).status_code, status.HTTP_403_FORBIDDEN)
        response = client.get(reverse('shipping-options'))
        self.assertEqual(response.json()['zones'][0]['provinces'], ['caba', 'buenos_aires'])
        self.assertIsNone(response.json()['pickup_address'])
        with override_settings(STORE_PICKUP_ADDRESS='Florida 100, CABA'):
            self.assertEqual(client.get(reverse('shipping-options')).json()['pickup_address'],
                             'Florida 100, CABA')


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class OrderShippingTests(APITestCase):
    def setUp(self):
        self.client.force_login(make_staff())
        product = Product.objects.create(name='ACME Hammer', price=1000, status=Product.Status.ACTIVE)
        customer = Customer.objects.create(name='Ana', email='ana@example.com')
        self.order = Order.objects.create_with_items(
            customer=customer, status=Order.Status.PAID, shipping_method=Order.ShippingMethod.DELIVERY,
            shipping_province='caba', shipping_address='Av. Siempre Viva 742', shipping_cost=1500,
            items=[{'product': product, 'quantity': 1}])
        self.url = reverse('order-detail', args=[self.order.number])

    def test_shipping_it_tells_the_customer_with_the_tracking(self):
        with self.captureOnCommitCallbacks(execute=True):
            response = self.client.patch(self.url, {
                'status': Order.Status.SHIPPED, 'carrier': 'Andreani', 'tracking_number': 'AR123'},
                format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.json())
        [message] = mail.outbox
        self.assertIn('on its way', message.subject)
        self.assertIn('Andreani', message.body)
        self.assertIn('AR123', message.body)
        self.assertIn(f'http://localhost:3000/orders/{self.order.number}', message.body)

        self.order.refresh_from_db()
        self.assertIsNotNone(self.order.shipped_at)
        self.assertIsNone(self.order.delivered_at)
        self.client.patch(self.url, {'status': Order.Status.DELIVERED}, format='json')
        self.order.refresh_from_db()
        self.assertIsNotNone(self.order.delivered_at)

    @override_settings(STORE_ENABLED=False)
    def test_without_the_store_the_mail_has_no_link(self):
        with self.captureOnCommitCallbacks(execute=True):
            self.client.patch(self.url, {'status': Order.Status.SHIPPED}, format='json')
        [message] = mail.outbox
        self.assertIn('on its way', message.subject)
        self.assertNotIn('/orders/', message.body)

    def test_what_the_customer_paid_doesnt_change(self):
        response = self.client.patch(self.url, {'shipping_cost': 0, 'shipping_province': 'jujuy'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.order.refresh_from_db()
        self.assertEqual((self.order.shipping_cost, self.order.shipping_province), (1500, 'caba'))
        self.assertEqual(response.json()['total'], 2500)
