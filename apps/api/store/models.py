from django.core.files.base import ContentFile
from django.db import models
from django.utils.text import slugify

from .images import generate_product_image, to_png


class NamedSlugModel(models.Model):
    """Unique `name`, with a `slug` filled from it on the first save unless one is given."""
    slug = models.SlugField(max_length=255, blank=True, unique=True)
    name = models.CharField(max_length=255, unique=True)

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self): return self.name


class Brand(NamedSlugModel):
    pass


class Category(NamedSlugModel):
    description = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ["name"]


class Product(NamedSlugModel):
    class Status(models.TextChoices):
        DRAFT = ('draft', 'Draft')
        ACTIVE = ('active', 'Active')
        INACTIVE = ('inactive', 'Inactive')
        OUT_OF_STOCK = ('out_of_stock', 'Out of stock')
        DISCONTINUED = ('discontinued', 'Discontinued')

    sku = models.CharField('SKU', max_length=255, blank=True, null=True)

    description = models.TextField(blank=True, null=True)

    image = models.ImageField(upload_to='products', blank=True, null=True)

    category = models.ForeignKey(
        Category, models.SET_NULL, null=True, blank=True)
    brand = models.ForeignKey(Brand, models.SET_NULL, null=True, blank=True)

    status = models.CharField(
        max_length=20, choices=Status.choices, default='draft')
    featured = models.BooleanField(default=False)

    price = models.PositiveIntegerField(default=0, blank=True, null=True)
    discount_price = models.PositiveIntegerField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def generate_sku(self):
        id = str(self.pk)
        first = self.name.replace(" ", "")[0:5].upper()
        self.sku = first+"-"+"0"*(4-len(id))+id if len(id) < 4 else id
        self.save()
        return True

    def save(self, *args, **kwargs):
        if not self.image:
            image = generate_product_image(self.name)
            self.image.save(f'{slugify(self.name)}.png', ContentFile(to_png(image)), save=False)
        super().save(*args, **kwargs)

    @property
    def has_discount(self):
        return self.discount_price is not None and self.discount_price < self.price

    @property
    def discount_porcentage(self):
        if self.has_discount:
            return round((1 - self.discount_price / self.price) * 100)
        return 0

    @property
    def active_price(self):
        return self.discount_price if self.has_discount else self.price
