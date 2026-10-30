import tempfile

from allauth.account.models import EmailAddress
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core import mail
from django.core.cache import cache
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from config.testing import make_staff
from orders.models import Customer, Order
from store.models import Product

from .models import Cart, MAX_QUANTITY

User = get_user_model()

ALLAUTH = '/_allauth/browser/v1'
PASSWORD = 'una clave bien larga'
CHECKOUT = {
    'name': 'Ana Pérez',
    'email': 'ana@example.com',
    'phone': '1155550000',
    'document_type': Customer.DocumentType.DNI,
    'document_number': '30111222',
    'vat_condition': Customer.VatCondition.FINAL_CONSUMER,
    'shipping_address': 'Av. Siempre Viva 742, CABA',
}


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class CartTestCase(APITestCase):
    def setUp(self):
        cache.clear()
        self.hammer = Product.objects.create(name='ACME Hammer', price=1000, status=Product.Status.ACTIVE)
        self.saw = Product.objects.create(
            name='ACME Saw', price=2000, discount_percent=10, status=Product.Status.ACTIVE)

    def add(self, product, quantity=1, client=None):
        return (client or self.client).post(
            reverse('cart-items'), {'product': product.pk, 'quantity': quantity}, format='json')

    def cart(self, client=None):
        return (client or self.client).get(reverse('cart')).json()

    def checkout(self, client=None, **data):
        return (client or self.client).post(reverse('checkout'), {**CHECKOUT, **data}, format='json')

    def customer_user(self, email='ana@example.com'):
        user = User.objects.create(username=email.split('@')[0], email=email)
        user.set_password(PASSWORD)
        user.save()
        EmailAddress.objects.create(user=user, email=email, verified=True, primary=True)
        return user

    def log_in(self, email='ana@example.com', client=None):
        response = (client or self.client).post(
            f'{ALLAUTH}/auth/login', {'email': email, 'password': PASSWORD}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class CartTests(CartTestCase):
    def test_a_guest_has_an_empty_cart_and_no_session(self):
        self.assertEqual(self.cart(), {'items': [], 'count': 0, 'total': 0})
        self.assertNotIn('sessionid', self.client.cookies)

    def test_a_guest_fills_a_cart_that_outlives_the_browser(self):
        response = self.add(self.hammer, 2)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.cookies['sessionid']['max-age'], settings.CUSTOMER_SESSION_AGE)
        self.add(self.saw)
        cart = self.cart()
        self.assertEqual([(i['product']['name'], i['quantity']) for i in cart['items']],
                         [('ACME Hammer', 2), ('ACME Saw', 1)])
        # The saw with its 10% off.
        self.assertEqual((cart['count'], cart['total']), (3, 2000 + 1800))
        # Absolute, like the catalog's (MEDIA_URL): the store shows them from Django's media.
        self.assertTrue(cart['items'][0]['product']['image'].startswith(settings.MEDIA_URL))

    def test_adding_again_adds_up_to_the_maximum(self):
        self.add(self.hammer, 2)
        self.add(self.hammer, 3)
        self.assertEqual(self.cart()['items'][0]['quantity'], 5)
        self.add(self.hammer, MAX_QUANTITY)
        self.assertEqual(self.cart()['items'][0]['quantity'], MAX_QUANTITY)

    def test_only_products_for_sale(self):
        for product_status in [Product.Status.OUT_OF_STOCK, Product.Status.DRAFT]:
            with self.subTest(product_status):
                product = Product.objects.create(name=f'ACME {product_status}', price=10, status=product_status)
                self.assertEqual(self.add(product).status_code, status.HTTP_400_BAD_REQUEST)
        no_price = Product.objects.create(name='ACME Free', price=None, status=Product.Status.ACTIVE)
        self.assertEqual(self.add(no_price).status_code, status.HTTP_400_BAD_REQUEST)

    def test_changes_and_removes_an_item(self):
        self.add(self.hammer)
        self.add(self.saw)
        item = reverse('cart-item', args=[self.hammer.pk])
        response = self.client.patch(item, {'quantity': 4}, format='json')
        self.assertEqual(response.json()['count'], 5)
        self.assertEqual(self.client.patch(item, {'quantity': 0}, format='json').status_code,
                         status.HTTP_400_BAD_REQUEST)
        response = self.client.delete(item)
        self.assertEqual([i['product']['name'] for i in response.json()['items']], ['ACME Saw'])
        self.assertEqual(self.client.delete(item).status_code, status.HTTP_404_NOT_FOUND)

    def test_each_visitor_has_their_own(self):
        self.add(self.hammer)
        other = APIClient()
        self.assertEqual(self.cart(other)['items'], [])
        self.assertEqual(other.delete(reverse('cart-item', args=[self.hammer.pk])).status_code,
                         status.HTTP_404_NOT_FOUND)

    def test_a_product_that_stops_being_for_sale_stays_out_of_the_total(self):
        self.add(self.hammer)
        self.add(self.saw)
        Product.objects.filter(pk=self.saw.pk).update(status=Product.Status.OUT_OF_STOCK)
        cart = self.cart()
        self.assertEqual([i['available'] for i in cart['items']], [True, False])
        self.assertEqual((cart['count'], cart['total']), (1, 1000))

    def test_guests_need_the_csrf_token_too(self):
        client = APIClient(enforce_csrf_checks=True)
        self.assertEqual(self.add(self.hammer, client=client).status_code, status.HTTP_403_FORBIDDEN)
        # The store reads /auth/user/ first, which sets the token.
        client.get(reverse('user-details'))
        token = client.cookies['csrftoken'].value
        response = client.post(reverse('cart-items'), {'product': self.hammer.pk}, format='json',
                               headers={'X-CSRFToken': token})
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class LoginMergeTests(CartTestCase):
    def test_the_guest_cart_becomes_the_account_one(self):
        user = self.customer_user()
        self.add(self.hammer, 2)
        self.log_in()
        self.assertEqual(Cart.objects.get(user=user).items.get().quantity, 2)
        self.assertEqual(self.cart()['count'], 2)

    def test_it_joins_the_account_cart(self):
        user = self.customer_user()
        account = APIClient()
        self.log_in(client=account)
        self.add(self.hammer, 1, client=account)

        self.add(self.hammer, 2)
        self.add(self.saw)
        self.log_in()
        self.assertEqual(
            sorted(Cart.objects.get(user=user).items.values_list('product__name', 'quantity')),
            [('ACME Hammer', 3), ('ACME Saw', 1)])
        self.assertEqual(Cart.objects.count(), 1)

    def test_logging_out_leaves_it_in_the_account(self):
        self.customer_user()
        self.log_in()
        self.add(self.hammer)
        self.client.delete(f'{ALLAUTH}/auth/session')
        self.assertEqual(self.cart()['items'], [])
        self.log_in()
        self.assertEqual(self.cart()['count'], 1)

    def test_staff_logging_in_after_a_guest_cart_get_their_own_session(self):
        staff = make_staff('otro')
        staff.set_password(PASSWORD)
        staff.save()
        self.add(self.hammer)
        response = self.client.post(f'{ALLAUTH}/auth/login', {'username': 'otro', 'password': PASSWORD}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(self.client.session.get_expire_at_browser_close())


class CheckoutTests(CartTestCase):
    def test_a_guest_places_an_order(self):
        self.add(self.hammer, 2)
        self.add(self.saw)
        with self.captureOnCommitCallbacks(execute=True):
            response = self.checkout()
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        order = Order.objects.get(number=response.json()['number'])
        self.assertEqual(order.status, Order.Status.PENDING)
        self.assertEqual(order.shipping_address, CHECKOUT['shipping_address'])
        self.assertEqual(order.total, 2 * 1000 + 1800)
        self.assertEqual(order.customer.name, 'Ana Pérez')
        self.assertIsNone(order.customer.user)
        self.assertEqual(self.cart()['items'], [])

        [message] = mail.outbox
        self.assertEqual(message.to, ['ana@example.com'])
        self.assertIn(order.number, message.subject)
        self.assertIn('$ 3.800', message.body)
        self.assertIn(f'http://localhost:3000/orders/{order.number}', message.body)

        # The guest sees it in this session, nobody else does.
        detail = reverse('my-order-detail', args=[order.number])
        self.assertEqual(self.client.get(detail).json()['total'], 3800)
        self.assertEqual(APIClient().get(detail).status_code, status.HTTP_404_NOT_FOUND)

    def test_each_guest_purchase_gets_its_own_customer(self):
        for _ in range(2):
            self.add(self.hammer)
            self.assertEqual(self.checkout().status_code, status.HTTP_201_CREATED)
        self.assertEqual(Customer.objects.filter(email='ana@example.com').count(), 2)

    def test_a_customer_keeps_one_customer_with_their_orders(self):
        user = self.customer_user()
        self.log_in()
        self.add(self.hammer)
        self.checkout()
        self.add(self.saw)
        self.checkout(phone='1166660000')

        customer = Customer.objects.get(user=user)
        self.assertEqual(customer.phone, '1166660000')
        self.assertEqual(customer.orders.count(), 2)
        orders = self.client.get(reverse('my-order-list')).json()
        self.assertEqual(len(orders), 2)
        # Logged out, they're not visible anymore.
        self.client.delete(f'{ALLAUTH}/auth/session')
        self.assertEqual(self.client.get(reverse('my-order-list')).json(), [])

    def test_a_guest_cannot_join_an_account_by_its_email(self):
        user = self.customer_user()
        self.add(self.hammer)
        self.checkout(email=user.email)
        self.assertFalse(Customer.objects.filter(user=user).exists())

    def test_an_empty_cart(self):
        self.assertEqual(self.checkout().status_code, status.HTTP_400_BAD_REQUEST)

    def test_products_no_longer_for_sale(self):
        self.add(self.hammer)
        Product.objects.filter(pk=self.hammer.pk).update(status=Product.Status.OUT_OF_STOCK)
        response = self.checkout()
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertIn('ACME Hammer', response.json()['detail'])
        self.assertFalse(Order.objects.exists())

    def test_billing_data_is_validated_like_the_admin(self):
        self.add(self.hammer)
        response = self.checkout(
            vat_condition=Customer.VatCondition.REGISTERED, document_type=Customer.DocumentType.DNI)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('document_number', response.json())
        response = self.checkout(
            vat_condition=Customer.VatCondition.REGISTERED, document_type=Customer.DocumentType.CUIT,
            document_number='20-12345678-6', legal_name='Ana SRL')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Order.objects.get().customer.document_number, '20123456786')

    def test_needs_the_contact_and_the_address(self):
        self.add(self.hammer)
        response = self.checkout(email='', shipping_address='')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(set(response.json()), {'email', 'shipping_address'})
