from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from store.models import Product
from .models import Order, OrderItem

User = get_user_model()


class OrdersTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create(
            username='acmeinc', password='password123')
        self.customer = User.objects.create(username='customer')
        self.client.force_login(self.user)
        self.base_url = reverse('order-list')

    def test_order_create_with_product_active(self):
        product = Product.objects.create(
            name='ACME Hammer', status=Product.Status.OUT_OF_STOCK)
        items = [{'product': product.pk}]
        data = {'customer': self.customer.pk, 'items': items}
        response = self.client.post(self.base_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
 
    def test_order_create_with_items(self):
        products = Product.objects.bulk_create(
            [Product(name=f'Product {i}', status=Product.Status.ACTIVE, slug=f'slug-{i}', sku=f'sku-{i}') for i in range(2)])
        items = [{'product': p.pk} for p in products]
        data = {'customer': self.customer.pk, 'items': items}
        response = self.client.post(self.base_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(response.data['items']), len(items))

    def test_order_create_with_items_unit_price(self):
        product = Product.objects.create(
            name='Prod 1', price=10, status=Product.Status.ACTIVE)
        # the unit price should not be captured
        unit_price_bait = 11
        items = [{'product': product.pk, 'unit_price': unit_price_bait}]
        data = {'customer': self.customer.pk, 'items': items}
        response = self.client.post(self.base_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertNotEqual(response.data['items'][0]['unit_price'],
                            unit_price_bait, 'The unit price should not be changed by the user')
        self.assertEqual(response.data['items']
                         [0]['unit_price'], product.price, '')

    def test_order_create_with_items_subtotal_and_total(self):
        # price = 100, 200, 300
        products = Product.objects.bulk_create(
            [Product(name=f'Product {i}', status=Product.Status.ACTIVE, slug=f'slug-{i}', sku=f'sku-{i}', price=i*100) for i in range(1, 3+1)])
        items = [{'product': p.pk} for p in products]
        data = {'customer': self.customer.pk, 'items': items}
        response = self.client.post(self.base_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # subtotal
        # We assume unit_price === product.price
        for item in response.data['items']:
            self.assertEqual(item['subtotal'],
                             item['unit_price'] * item['quantity'])
            self.assertEqual(item['subtotal'], item['quantity'] * next(
                (p for p in products if p.pk == item['product']), None).price)
        # total
        self.assertEqual(
            sum([item['subtotal'] for item in response.data['items']]), response.data['total'])

    def test_order_update_ignore_items(self):
        order = Order.objects.create(customer=self.customer)
        product = Product.objects.create(name='ACME TNT Sticks', status=Product.Status.ACTIVE)
        OrderItem.objects.create(order=order, product=product)
        url = reverse('order-detail', kwargs={'pk': order.pk})
        # empty list
        data = {'customer': self.customer.pk, 'items': []}
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotEqual(len(response.data['items']), len(data['items']))
        # charged list
        data = {'customer': self.customer.pk, 'items': [
            {'product': 2026, 'quantity': 100}]}
        response = self.client.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotEqual(
            response.data['items'][0]['product'], data['items'][0]['product'])
        self.assertNotEqual(
            response.data['items'][0]['quantity'], data['items'][0]['quantity'])

   
