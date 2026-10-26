import tempfile
from datetime import datetime, timezone as dt_timezone

from django.urls import reverse
from django.contrib.auth import get_user_model
from django.test import override_settings
from rest_framework.test import APITestCase
from rest_framework import status
from django.db import IntegrityError, transaction
from store.models import Product
from .models import Customer, Order, OrderItem

User = get_user_model()


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class CustomerNameTests(APITestCase):
    def test_name_is_unique(self):
        Customer.objects.create(name='Juan Pérez')
        with self.assertRaises(IntegrityError), transaction.atomic():
            Customer.objects.create(name='Juan Pérez')

    def test_api_rejects_duplicate_name(self):
        self.client.force_login(User.objects.create(username='admin'))
        Customer.objects.create(name='Juan Pérez')
        response = self.client.post(reverse('customer-list'), {'name': 'Juan Pérez'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('name', response.json())


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class CustomerChoicesTests(APITestCase):
    def setUp(self):
        Customer.objects.create(name='Juan Pérez')
        Customer.objects.create(name='Ana Gómez')

    def test_requires_a_session(self):
        response = self.client.get(reverse('customer-choices'))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_lists_all_unpaginated(self):
        self.client.force_login(User.objects.create(username='admin'))
        response = self.client.get(reverse('customer-choices'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual({c['name'] for c in response.json()}, {'Juan Pérez', 'Ana Gómez'})

    def test_applies_search(self):
        self.client.force_login(User.objects.create(username='admin'))
        response = self.client.get(reverse('customer-choices'), {'search': 'juan'})
        self.assertEqual([c['name'] for c in response.json()], ['Juan Pérez'])

    def test_leaves_out_contact_and_document(self):
        self.client.force_login(User.objects.create(username='admin'))
        response = self.client.get(reverse('customer-choices'))
        self.assertEqual(set(response.json()[0]), {'id', 'name', 'image'})


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class OrderCustomerDetailTests(APITestCase):
    def setUp(self):
        self.client.force_login(User.objects.create(username='admin'))
        customer = Customer.objects.create(
            name='Juan Pérez', email='juan@example.com', phone='1155550000',
            document_number='20123456786')
        self.order = Order.objects.create(customer=customer)

    def test_leaves_out_phone_and_document(self):
        for url in (reverse('order-list'), reverse('order-detail', args=[self.order.number])):
            with self.subTest(url=url):
                response = self.client.get(url)
                data = response.json()
                order = data['results'][0] if 'results' in data else data
                self.assertEqual(
                    order['customer_detail'],
                    {'id': self.order.customer.id, 'name': 'Juan Pérez',
                     'email': 'juan@example.com', 'image': order['customer_detail']['image']})

    def test_customer_detail_keeps_everything(self):
        response = self.client.get(reverse('customer-detail', args=[self.order.customer.id]))
        self.assertEqual(response.json()['phone'], '1155550000')
        self.assertEqual(response.json()['document_number'], '20123456786')


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class OrderTestCase(APITestCase):
    def setUp(self):
        self.client.force_login(User.objects.create(username='admin'))
        self.customer = Customer.objects.create(name='ACME Inc')

    def create_product(self, name='ACME Hammer', price=100, status=Product.Status.ACTIVE):
        return Product.objects.create(name=name, price=price, status=status)

    def post_order(self, items, **data):
        return self.client.post(
            reverse('order-list'), {'customer': self.customer.pk, 'items': items, **data}, format='json')


class OrderCreateTests(OrderTestCase):
    def test_creates_order_with_items(self):
        hammer, saw = self.create_product('ACME Hammer'), self.create_product('ACME Saw')
        response = self.post_order([{'product': hammer.pk}, {'product': saw.pk, 'quantity': 3}])
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            [(i['product'], i['quantity']) for i in response.data['items']],
            [(hammer.pk, 1), (saw.pk, 3)])

    def test_assigns_a_sequential_number(self):
        response = self.post_order([{'product': self.create_product().pk}])
        order = Order.objects.get()
        self.assertEqual(response.data['number'], f'ORD-{order.pk:06d}')

    def test_starts_pending(self):
        response = self.post_order([{'product': self.create_product().pk}])
        self.assertEqual(response.data['status'], Order.Status.PENDING)

    def test_rejects_inactive_product(self):
        for product_status in (Product.Status.DRAFT, Product.Status.OUT_OF_STOCK):
            with self.subTest(status=product_status):
                product = self.create_product(name=f'ACME {product_status}', status=product_status)
                response = self.post_order([{'product': product.pk}])
                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
                self.assertIn('product', response.data['items'][0])
        self.assertFalse(Order.objects.exists())

    def test_rejects_unknown_customer(self):
        response = self.post_order([{'product': self.create_product().pk}], customer=2026)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('customer', response.data)

    def test_unit_price_comes_from_the_product(self):
        product = self.create_product(price=10)
        response = self.post_order([{'product': product.pk, 'unit_price': 11}])
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['items'][0]['unit_price'], 10)

    def test_unit_price_applies_the_product_discount(self):
        product = self.create_product(price=1000)
        product.discount_percent = 15
        product.save()
        response = self.post_order([{'product': product.pk, 'quantity': 2}])
        self.assertEqual(response.data['items'][0]['unit_price'], 850)
        self.assertEqual(response.data['total'], 1700)

    def test_unit_price_does_not_follow_later_discount_changes(self):
        product = self.create_product(price=1000)
        response = self.post_order([{'product': product.pk}])
        product.discount_percent = 50
        product.save()
        response = self.client.get(reverse('order-detail', args=[response.data['number']]))
        self.assertEqual(response.data['items'][0]['unit_price'], 1000)

    def test_unit_price_does_not_follow_later_price_changes(self):
        product = self.create_product(price=10)
        response = self.post_order([{'product': product.pk}])
        product.price = 20
        product.save()
        response = self.client.get(reverse('order-detail', args=[response.data['number']]))
        self.assertEqual(response.data['items'][0]['unit_price'], 10)

    def test_computes_subtotals_and_total(self):
        products = [self.create_product(f'Product {price}', price=price) for price in (100, 200, 300)]
        response = self.post_order([{'product': p.pk, 'quantity': 2} for p in products])
        self.assertEqual([i['subtotal'] for i in response.data['items']], [200, 400, 600])
        self.assertEqual(response.data['total'], 1200)


class OrderUpdateTests(OrderTestCase):
    def setUp(self):
        super().setUp()
        self.product = self.create_product()
        self.order = Order.objects.create(customer=self.customer)
        OrderItem.objects.create(order=self.order, product=self.product, quantity=2)
        self.url = reverse('order-detail', args=[self.order.number])

    def test_updates_status(self):
        response = self.client.patch(self.url, {'status': Order.Status.PAID}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.order.refresh_from_db()
        self.assertEqual(self.order.status, Order.Status.PAID)

    def test_ignores_items(self):
        other = self.create_product('ACME Saw')
        for items in ([], [{'product': other.pk, 'quantity': 100}]):
            with self.subTest(items=items):
                response = self.client.put(
                    self.url, {'customer': self.customer.pk, 'items': items}, format='json')
                self.assertEqual(response.status_code, status.HTTP_200_OK)
                self.assertEqual(
                    [(i['product'], i['quantity']) for i in response.data['items']],
                    [(self.product.pk, 2)])

    def test_number_cannot_be_changed(self):
        response = self.client.patch(self.url, {'number': 'ORD-999999'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.order.refresh_from_db()
        self.assertEqual(self.order.number, f'ORD-{self.order.pk:06d}')


class OrderListTests(OrderTestCase):
    def test_filters_by_status(self):
        Order.objects.create(customer=self.customer, status=Order.Status.PAID)
        Order.objects.create(customer=self.customer, status=Order.Status.SHIPPED)
        Order.objects.create(customer=self.customer, status=Order.Status.CANCELLED)
        response = self.client.get(reverse('order-list'), {'status': ['paid', 'shipped']})
        self.assertEqual(
            {o['status'] for o in response.data['results']}, {'paid', 'shipped'})

    def test_searches_by_customer(self):
        Order.objects.create(customer=self.customer)
        Order.objects.create(customer=Customer.objects.create(name='Wile E. Coyote'))
        response = self.client.get(reverse('order-list'), {'search': 'coyote'})
        self.assertEqual(
            [o['customer_detail']['name'] for o in response.data['results']], ['Wile E. Coyote'])

    def test_orders_by_total(self):
        product = self.create_product(price=100)
        for quantity in (2, 3, 1):
            order = Order.objects.create(customer=self.customer)
            OrderItem.objects.create(order=order, product=product, quantity=quantity)
        empty = Order.objects.create(customer=self.customer)
        for ordering, expected in (('total', [0, 100, 200, 300]), ('-total', [300, 200, 100, 0])):
            with self.subTest(ordering=ordering):
                response = self.client.get(reverse('order-list'), {'ordering': ordering})
                self.assertEqual(response.status_code, status.HTTP_200_OK)
                self.assertEqual([o['total'] for o in response.data['results']], expected)
        self.assertEqual(empty.total, 0)

    def test_excludes_statuses(self):
        Order.objects.create(customer=self.customer, status=Order.Status.PAID)
        Order.objects.create(customer=self.customer, status=Order.Status.SHIPPED)
        Order.objects.create(customer=self.customer, status=Order.Status.CANCELLED)
        response = self.client.get(reverse('order-list'), {'status__not': ['paid', 'shipped']})
        self.assertEqual([o['status'] for o in response.data['results']], ['cancelled'])

    def test_filters_by_customer(self):
        coyote = Customer.objects.create(name='Wile E. Coyote')
        Order.objects.create(customer=self.customer)
        Order.objects.create(customer=coyote)
        for params, expected in (({'customer': [coyote.pk]}, ['Wile E. Coyote']),
                                 ({'customer__not': [coyote.pk]}, ['ACME Inc'])):
            with self.subTest(params=params):
                response = self.client.get(reverse('order-list'), params)
                self.assertEqual(
                    [o['customer_detail']['name'] for o in response.data['results']], expected)

    def test_filters_by_total(self):
        product = self.create_product(price=100)
        for quantity in (1, 2, 3):
            order = Order.objects.create(customer=self.customer)
            OrderItem.objects.create(order=order, product=product, quantity=quantity)
        Order.objects.create(customer=self.customer)
        for params, expected in (({'total__gte': 200}, {200, 300}),
                                 ({'total__range': '100,200'}, {100, 200}),
                                 ({'total__not_range': '100,200'}, {0, 300}),
                                 ({'total__not': 0}, {100, 200, 300})):
            with self.subTest(params=params):
                response = self.client.get(reverse('order-list'), params)
                self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
                self.assertEqual({o['total'] for o in response.data['results']}, expected)

    def test_filters_by_created_day(self):
        old = Order.objects.create(customer=self.customer)
        Order.objects.create(customer=self.customer)
        Order.objects.filter(pk=old.pk).update(
            created_at=datetime(2026, 10, 3, 23, 30, tzinfo=dt_timezone.utc))
        response = self.client.get(reverse('order-list'), {'created_at': '2026-10-03'})
        self.assertEqual([o['number'] for o in response.data['results']], [old.number])

    def test_requires_a_session(self):
        self.client.logout()
        response = self.client.get(reverse('order-list'))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class CustomerDestroyTests(OrderTestCase):
    def test_deletes_customer_without_orders(self):
        response = self.client.delete(reverse('customer-detail', args=[self.customer.pk]))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_customer_with_orders_is_a_conflict(self):
        Order.objects.create(customer=self.customer)
        response = self.client.delete(reverse('customer-detail', args=[self.customer.pk]))
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(response.json()['detail'], "It can't be deleted because it's used in 1 order.")
        self.assertTrue(Customer.objects.filter(pk=self.customer.pk).exists())
