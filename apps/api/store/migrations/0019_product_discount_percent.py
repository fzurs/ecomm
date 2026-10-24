import django.core.validators
from django.db import migrations, models


def discount_price_to_percent(apps, schema_editor):
    """`discount_price` was the final price; discounts that didn't lower the price are dropped."""
    Product = apps.get_model('store', 'Product')
    for product in Product.objects.exclude(discount_price=None):
        if product.price and product.discount_price < product.price:
            percent = round((1 - product.discount_price / product.price) * 100)
            product.discount_percent = min(max(percent, 1), 99)
            product.save(update_fields=['discount_percent'])


def discount_percent_to_price(apps, schema_editor):
    Product = apps.get_model('store', 'Product')
    for product in Product.objects.exclude(discount_percent=None):
        if product.price:
            product.discount_price = (product.price * (100 - product.discount_percent) + 50) // 100
            product.save(update_fields=['discount_price'])


class Migration(migrations.Migration):

    dependencies = [
        ('store', '0018_alter_brand_name_alter_category_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='discount_percent',
            field=models.PositiveSmallIntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(1), django.core.validators.MaxValueValidator(99)]),
        ),
        migrations.RunPython(discount_price_to_percent, discount_percent_to_price),
        migrations.RemoveField(
            model_name='product',
            name='discount_price',
        ),
        migrations.AddConstraint(
            model_name='product',
            constraint=models.CheckConstraint(condition=models.Q(('discount_percent__isnull', True), ('discount_percent__range', (1, 99)), _connector='OR'), name='product_discount_percent_range'),
        ),
    ]
