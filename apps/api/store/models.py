from django.core.files.base import ContentFile
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils.text import slugify

from .images import generate_product_image, to_png


class VatRate(models.IntegerChoices):
    """IVA of a product, as ARCA's IVA type ids (FEParamGetTiposIva). Prices include it.

    3 to 9 are `arca_client.Alicuota`; 1 and 2 are not rates: they go as `no_gravado` and
    `exento` on the voucher.
    """
    NON_TAXED = 1, 'Non-taxed'
    EXEMPT = 2, 'Exempt'
    VAT_0 = 3, '0%'
    VAT_10_5 = 4, '10.5%'
    VAT_21 = 5, '21%'
    VAT_27 = 6, '27%'
    VAT_5 = 8, '5%'
    VAT_2_5 = 9, '2.5%'


def build_sku(name: str, pk: int) -> str:
    """
    "<first 5 letters or digits of the name>-<pk padded to 4 digits>", e.g. "ACMEH-0042".
    Accents are dropped and symbols ignored; the pk keeps it unique.
    """
    prefix = slugify(name).replace('-', '')[:5].upper()
    number = f'{pk:04d}'
    return f'{prefix}-{number}' if prefix else number


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
    discount_percent = models.PositiveSmallIntegerField(
        blank=True, null=True, validators=[MinValueValidator(1), MaxValueValidator(99)])
    vat_rate = models.PositiveSmallIntegerField(choices=VatRate.choices, default=VatRate.VAT_21)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.CheckConstraint(
                condition=models.Q(discount_percent__isnull=True) | models.Q(discount_percent__range=(1, 99)),
                name='product_discount_percent_range',
            ),
        ]

    def generate_sku(self):
        """Sets and saves the SKU built by `build_sku`. Needs a saved product, since it uses the pk."""
        if self.pk is None:
            raise ValueError("Can't generate a SKU for an unsaved product.")
        self.sku = build_sku(self.name, self.pk)
        self.save(update_fields=['sku'])

    def save(self, *args, **kwargs):
        if not self.image:
            image = generate_product_image(self.name)
            self.image.save(f'{slugify(self.name)}.png', ContentFile(to_png(image)), save=False)
        super().save(*args, **kwargs)

    @property
    def has_discount(self):
        return bool(self.discount_percent and self.price)

    @property
    def active_price(self):
        """`price` with `discount_percent` applied, rounded half up to the unit."""
        if not self.has_discount:
            return self.price
        return (self.price * (100 - self.discount_percent) + 50) // 100
