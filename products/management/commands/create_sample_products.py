import json
from django.core.management import BaseCommand
from ...models import Product
import os


class Command(BaseCommand):
    help = 'Create examples for products'

    def handle(self, *args, **options):
        with open(os.path.join(os.path.dirname(__file__), 'products_example.json'), 'r') as f:
            data = json.load(f)

        for product in data:
            Product.objects.create(**product)

        self.stdout.write(self.style.SUCCESS(
            f'successfully creation of {len(data)} products'))
