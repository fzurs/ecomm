import tempfile

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.db import IntegrityError, transaction
from django.test import SimpleTestCase, TestCase, override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from orders.models import Customer, Order, OrderItem

from .images import generate_customer_image, generate_product_image
from .models import Brand, Category, Product


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
