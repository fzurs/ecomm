import io
import tempfile
from datetime import datetime, timezone as dt_timezone

from django.contrib.auth import get_user_model
from django.core.management import CommandError, call_command
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db import IntegrityError, transaction
from django.test import SimpleTestCase, TestCase, override_settings
from django.urls import reverse
from drf_spectacular.generators import SchemaGenerator
from rest_framework import status
from rest_framework.test import APITestCase

from billing.models import Invoice
from billing.sample import SAMPLE_POINT_OF_SALE
from orders.models import Customer, Order, OrderItem

from .images import generate_customer_image, generate_product_image
from .models import Brand, Category, Product, build_sku
from .serializers import BrandChoiceSerializer, CategoryChoiceSerializer, ProductChoiceSerializer


class BuildSkuTests(SimpleTestCase):
    def test_uses_name_prefix_and_padded_pk(self):
        self.assertEqual(build_sku('ACME Hammer', 42), 'ACMEH-0042')

    def test_ignores_symbols_and_accents(self):
        self.assertEqual(build_sku('Ñandú-Café & Co.', 7), 'NANDU-0007')

    def test_short_name(self):
        self.assertEqual(build_sku('Saw', 1), 'SAW-0001')

    def test_keeps_prefix_with_long_pk(self):
        self.assertEqual(build_sku('ACME Hammer', 12345), 'ACMEH-12345')

    def test_name_without_letters_or_digits(self):
        self.assertEqual(build_sku('¡¿!?', 42), '0042')


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class GenerateSkuTests(APITestCase):
    def test_saves_sku(self):
        product = Product.objects.create(name='ACME Hammer')
        product.generate_sku()
        product.refresh_from_db()
        self.assertEqual(product.sku, build_sku('ACME Hammer', product.pk))

    def test_unsaved_product_raises(self):
        with self.assertRaises(ValueError):
            Product(name='ACME Hammer').generate_sku()

    def test_api_create_generates_sku(self):
        self.client.force_login(get_user_model().objects.create(username='admin'))
        response = self.client.post(reverse('product-list'), {'name': 'ACME Hammer'})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.json()['sku'], build_sku('ACME Hammer', response.json()['id']))

    def test_api_create_with_empty_sku_generates_it(self):
        self.client.force_login(get_user_model().objects.create(username='admin'))
        response = self.client.post(reverse('product-list'), {'name': 'ACME Hammer', 'sku': ''})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.json()['sku'], build_sku('ACME Hammer', response.json()['id']))

    def test_api_create_keeps_given_sku(self):
        self.client.force_login(get_user_model().objects.create(username='admin'))
        response = self.client.post(reverse('product-list'), {'name': 'ACME Hammer', 'sku': 'MY-SKU'})
        self.assertEqual(response.json()['sku'], 'MY-SKU')

    def test_generate_sku_endpoint(self):
        self.client.force_login(get_user_model().objects.create(username='admin'))
        product = Product.objects.create(name='ACME Hammer', sku='OLD')
        response = self.client.post(reverse('product-generate-sku', args=[product.slug]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['sku'], build_sku('ACME Hammer', product.pk))


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class SlugTests(TestCase):
    models = (Brand, Category, Product)

    def test_generates_slug_from_name(self):
        for model in self.models:
            with self.subTest(model=model.__name__):
                obj = model.objects.create(name='ACME  Hammer & Saw!')
                self.assertEqual(obj.slug, 'acme-hammer-saw')

    def test_strips_accents(self):
        for model in self.models:
            with self.subTest(model=model.__name__):
                obj = model.objects.create(name='Ñandú Café')
                self.assertEqual(obj.slug, 'nandu-cafe')

    def test_keeps_explicit_slug(self):
        for model in self.models:
            with self.subTest(model=model.__name__):
                obj = model.objects.create(name='ACME Hammer', slug='custom-slug')
                self.assertEqual(obj.slug, 'custom-slug')

    def test_keeps_slug_when_name_changes(self):
        for model in self.models:
            with self.subTest(model=model.__name__):
                obj = model.objects.create(name='ACME Hammer')
                obj.name = 'ACME Saw'
                obj.save()
                obj.refresh_from_db()
                self.assertEqual(obj.slug, 'acme-hammer')

    def test_name_is_unique(self):
        for model in self.models:
            with self.subTest(model=model.__name__):
                model.objects.create(name='ACME Saw')
                with self.assertRaises(IntegrityError), transaction.atomic():
                    model.objects.create(name='ACME Saw', slug='another-slug')

    def test_names_with_the_same_slug_collide(self):
        for model in self.models:
            with self.subTest(model=model.__name__):
                model.objects.create(name='ACME Hammer')
                with self.assertRaises(IntegrityError), transaction.atomic():
                    model.objects.create(name='acme hammer!')


class ImageGenerationTests(SimpleTestCase):
    def test_same_name_yields_same_image(self):
        for generate in (generate_customer_image, generate_product_image):
            with self.subTest(generate=generate.__name__):
                self.assertEqual(
                    generate('ACME Hammer').tobytes(), generate('ACME Hammer').tobytes())
                self.assertNotEqual(
                    generate('ACME Hammer').tobytes(), generate('ACME Saw').tobytes())

    def test_respects_size(self):
        for generate in (generate_customer_image, generate_product_image):
            with self.subTest(generate=generate.__name__):
                image = generate('ACME Hammer', size=(120, 80))
                self.assertEqual(image.size, (120, 80))
                self.assertEqual(image.mode, 'RGB')


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class ProductImageTests(TestCase):
    def test_generates_image_when_missing(self):
        product = Product.objects.create(name='ACME Hammer')
        self.assertEqual(product.image.name, 'products/acme-hammer.png')

    def test_keeps_uploaded_image(self):
        upload = SimpleUploadedFile('photo.png', b'fake', content_type='image/png')
        product = Product.objects.create(name='ACME Hammer', image=upload)
        self.assertEqual(product.image.name, 'products/photo.png')


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class PublicReadPermissionTests(APITestCase):
    basenames = ('product', 'category', 'brand')

    def setUp(self):
        self.objects = {
            'product': Product.objects.create(name='ACME Hammer'),
            'category': Category.objects.create(name='Tools'),
            'brand': Brand.objects.create(name='ACME'),
        }

    def test_anonymous_can_read(self):
        for basename in self.basenames:
            slug = self.objects[basename].slug
            for url in (reverse(f'{basename}-list'), reverse(f'{basename}-choices'),
                        reverse(f'{basename}-detail', args=[slug])):
                with self.subTest(url=url):
                    self.assertEqual(self.client.get(url).status_code, status.HTTP_200_OK)

    def test_anonymous_cannot_write(self):
        for basename in self.basenames:
            detail = reverse(f'{basename}-detail', args=[self.objects[basename].slug])
            requests = [
                (self.client.post, reverse(f'{basename}-list')),
                (self.client.patch, detail),
                (self.client.delete, detail),
            ]
            for method, url in requests:
                with self.subTest(method=method.__name__, url=url):
                    self.assertEqual(method(url, {'name': 'New'}).status_code, status.HTTP_403_FORBIDDEN)

    def test_anonymous_cannot_generate_sku(self):
        url = reverse('product-generate-sku', args=[self.objects['product'].slug])
        self.assertEqual(self.client.post(url).status_code, status.HTTP_403_FORBIDDEN)


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class ChoicesTests(APITestCase):
    models = {'product': Product, 'category': Category, 'brand': Brand}
    choice_serializers = {
        'product': ProductChoiceSerializer,
        'category': CategoryChoiceSerializer,
        'brand': BrandChoiceSerializer,
    }

    def setUp(self):
        for model in self.models.values():
            model.objects.create(name='ACME Hammer')
            model.objects.create(name='Saw')

    def test_lists_all_unpaginated_with_choice_fields(self):
        for basename in self.models:
            with self.subTest(basename=basename):
                response = self.client.get(reverse(f'{basename}-choices'))
                self.assertEqual(response.status_code, status.HTTP_200_OK)
                self.assertIsInstance(response.json(), list)
                self.assertEqual({c['name'] for c in response.json()}, {'ACME Hammer', 'Saw'})
                self.assertEqual(
                    list(response.json()[0]), self.choice_serializers[basename].Meta.fields)

    def test_applies_search(self):
        for basename in self.models:
            with self.subTest(basename=basename):
                response = self.client.get(reverse(f'{basename}-choices'), {'search': 'hammer'})
                self.assertEqual([c['name'] for c in response.json()], ['ACME Hammer'])


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class ProductSearchTests(APITestCase):
    def test_searches_by_sku(self):
        Product.objects.create(name='ACME Hammer', sku='HAM-0001')
        Product.objects.create(name='ACME Saw', sku='SAW-0002')
        response = self.client.get(reverse('product-list'), {'search': 'saw-0002'})
        self.assertEqual([p['name'] for p in response.json()['results']], ['ACME Saw'])


class ActivePriceTests(SimpleTestCase):
    def test_without_discount_is_the_price(self):
        self.assertEqual(Product(price=1000).active_price, 1000)

    def test_applies_discount_percent(self):
        self.assertEqual(Product(price=1000, discount_percent=15).active_price, 850)

    def test_rounds_half_up(self):
        self.assertEqual(Product(price=45, discount_percent=10).active_price, 41)  # 40.5

    def test_without_price_has_no_discount(self):
        product = Product(price=None, discount_percent=10)
        self.assertFalse(product.has_discount)
        self.assertIsNone(product.active_price)


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class DiscountPercentTests(APITestCase):
    def setUp(self):
        self.client.force_login(get_user_model().objects.create(username='admin'))

    def test_api_returns_active_price(self):
        response = self.client.post(
            reverse('product-list'), {'name': 'ACME Hammer', 'price': 1000, 'discount_percent': 20})
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.json()['active_price'], 800)

    def test_api_rejects_out_of_range_percent(self):
        for percent in (0, 100):
            with self.subTest(percent=percent):
                response = self.client.post(
                    reverse('product-list'), {'name': f'ACME {percent}', 'price': 1000, 'discount_percent': percent})
                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
                self.assertIn('discount_percent', response.json())

    def test_db_rejects_out_of_range_percent(self):
        with self.assertRaises(IntegrityError), transaction.atomic():
            Product.objects.create(name='ACME Hammer', price=1000, discount_percent=100)


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class ProductDestroyTests(APITestCase):
    def setUp(self):
        self.client.force_login(get_user_model().objects.create(username='admin'))
        self.product = Product.objects.create(name='ACME Hammer', price=100)

    def test_deletes_unused_product(self):
        response = self.client.delete(reverse('product-detail', args=[self.product.slug]))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

    def test_product_in_an_order_is_a_conflict(self):
        order = Order.objects.create(customer=Customer.objects.create(name='ACME Inc'))
        OrderItem.objects.create(order=order, product=self.product)

        response = self.client.delete(reverse('product-detail', args=[self.product.slug]))

        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(
            response.json()['detail'], "It can't be deleted because it's used in 1 order item.")
        self.assertTrue(Product.objects.filter(pk=self.product.pk).exists())


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class SeedCommandTests(TestCase):
    def seed(self, *args):
        call_command('seed', *args, stdout=io.StringIO())

    def counts(self):
        return [model.objects.count() for model in (Brand, Category, Product, Customer, Order, OrderItem, Invoice)]

    def test_loads_data_through_the_models(self):
        self.seed()
        self.assertTrue(Order.objects.exists())
        product = Product.objects.first()
        self.assertTrue(product.slug and product.sku and product.image)
        self.assertTrue(Customer.objects.first().image)
        item = OrderItem.objects.select_related('order', 'product').first()
        self.assertTrue(item.order.number.startswith('ORD-'))
        self.assertEqual(item.unit_price, item.product.active_price)

    def test_is_idempotent(self):
        self.seed()
        counts = self.counts()
        self.seed()
        self.assertEqual(self.counts(), counts)

    def test_reset_recreates_the_data(self):
        self.seed()
        counts = self.counts()
        self.seed('--reset')
        self.assertEqual(self.counts(), counts)

    def test_loads_sample_invoices_on_their_own_point_of_sale(self):
        self.seed()
        invoices = Invoice.objects.all()
        self.assertTrue(invoices.exists())
        self.assertFalse(invoices.exclude(point_of_sale=SAMPLE_POINT_OF_SALE).exists())
        self.assertEqual(
            set(invoices.values_list('status', flat=True)),
            {Invoice.Status.AUTHORIZED, Invoice.Status.REJECTED, Invoice.Status.UNVERIFIED},
        )
        self.assertTrue(invoices.exclude(associated_invoice=None).exists())
        # Backdated with their order.
        invoice = invoices.filter(status=Invoice.Status.AUTHORIZED).select_related('order').first()
        self.assertEqual(invoice.issue_date, invoice.order.created_at.date())

    def test_reset_keeps_invoices_emitted_to_arca(self):
        self.seed()
        Invoice.objects.filter(pk=Invoice.objects.first().pk).update(point_of_sale=1)
        with self.assertRaisesMessage(CommandError, 'emitted to ARCA'):
            self.seed('--reset')


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class ProductFilterTests(APITestCase):
    def setUp(self):
        acme = Brand.objects.create(name='ACME')
        other = Brand.objects.create(name='Other')
        self.hammer = Product.objects.create(
            name='ACME Hammer', price=100, status='active', featured=True, brand=acme)
        self.saw = Product.objects.create(name='Saw', price=300, status='draft', brand=other)
        self.drill = Product.objects.create(name='Drill', price=500, status='archived')
        Product.objects.filter(pk=self.hammer.pk).update(
            created_at=datetime(2026, 10, 3, 23, 30, tzinfo=dt_timezone.utc))
        Product.objects.filter(pk__in=[self.saw.pk, self.drill.pk]).update(
            created_at=datetime(2026, 10, 5, 12, tzinfo=dt_timezone.utc))

    def names(self, query):
        response = self.client.get(reverse('product-list'), query)
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        return {product['name'] for product in response.data['results']}

    def test_text(self):
        self.assertEqual(self.names({'name__icontains': 'hammer'}), {'ACME Hammer'})
        self.assertEqual(self.names({'name__not_icontains': 'hammer'}), {'Saw', 'Drill'})

    def test_number(self):
        self.assertEqual(self.names({'price': 300}), {'Saw'})
        self.assertEqual(self.names({'price__not': 300}), {'ACME Hammer', 'Drill'})
        self.assertEqual(self.names({'price__lt': 300}), {'ACME Hammer'})
        self.assertEqual(self.names({'price__gte': 300}), {'Saw', 'Drill'})
        self.assertEqual(self.names({'price__range': '200,400'}), {'Saw'})
        self.assertEqual(self.names({'price__not_range': '200,400'}), {'ACME Hammer', 'Drill'})

    def test_date_compares_the_day(self):
        self.assertEqual(self.names({'created_at': '2026-10-03'}), {'ACME Hammer'})
        self.assertEqual(self.names({'created_at__gte': '2026-10-04'}), {'Saw', 'Drill'})
        self.assertEqual(self.names({'created_at__not_range': '2026-10-01,2026-10-03'}), {'Saw', 'Drill'})

    def test_option(self):
        self.assertEqual(self.names({'status': ['active', 'draft']}), {'ACME Hammer', 'Saw'})
        self.assertEqual(self.names({'status__not': ['active', 'draft']}), {'Drill'})
        self.assertEqual(self.names({'brand': ['acme']}), {'ACME Hammer'})
        self.assertEqual(self.names({'brand__not': ['acme']}), {'Saw', 'Drill'})

    def test_boolean(self):
        self.assertEqual(self.names({'featured': ['true']}), {'ACME Hammer'})
        self.assertEqual(self.names({'featured__not': ['true']}), {'Saw', 'Drill'})
        self.assertEqual(len(self.names({'featured': ['true', 'false']})), 3)


class ProductFilterSchemaTests(SimpleTestCase):
    def test_range_is_an_array_param(self):
        schema = SchemaGenerator().get_schema(request=None, public=True)
        params = {
            param['name']: param
            for param in schema['paths']['/products/']['get']['parameters']
        }
        self.assertEqual(params['price__range']['schema']['type'], 'array')
        self.assertIn('status__not', params)
        self.assertIn('created_at__gte', params)
