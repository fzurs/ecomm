import tempfile

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import SimpleTestCase, TestCase, override_settings

from .images import generate_customer_image, generate_product_image
from .models import Product


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
