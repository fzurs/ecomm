import re

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.utils.text import slugify

from orders.models import Customer
from store.images import generate_customer_image, generate_product_image, to_png
from store.models import Product


def is_generated(field, name: str) -> bool:
    # Generated files are "<upload_to>/<slug>.png", plus the "_<random>" suffix Django adds on clashes.
    upload_to = field.field.upload_to.rstrip('/')
    pattern = rf'{re.escape(upload_to)}/{re.escape(slugify(name))}(_\w{{7}})?\.png'
    return re.fullmatch(pattern, field.name) is not None


class Command(BaseCommand):
    help = 'Regenerates placeholder images for customers and products, keeping uploaded ones.'

    def handle(self, *args, **options):
        targets = [
            (Customer.objects.all(), generate_customer_image),
            (Product.objects.all(), generate_product_image),
        ]
        for queryset, generate in targets:
            updated = 0
            for obj in queryset:
                if obj.image and not is_generated(obj.image, obj.name):
                    continue
                if obj.image:
                    obj.image.delete(save=False)
                filename = f'{slugify(obj.name)}.png'
                obj.image.save(filename, ContentFile(to_png(generate(obj.name))), save=False)
                obj.save(update_fields=['image'])
                updated += 1
            self.stdout.write(f'{queryset.model.__name__}: {updated} of {queryset.count()} updated')
