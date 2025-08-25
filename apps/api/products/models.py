from django.db import models
from django.utils.text import slugify
import uuid


class Category(models.Model):
    name = models.CharField(max_length=100)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name

    @property
    def slug(self):
        return slugify(self.name)


class Brand(models.Model):
    name = models.CharField(
        max_length=100,
    )
    website = models.URLField(
        blank=True,
    )

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name

    @property
    def slug(self):
        return slugify(self.name)


class Product(models.Model):
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("active", "Active"),
        ("inactive", "Inactive"),
        ("out_of_stock", "Out of stock"),
        ("discontinued", "Discontinued"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=200, unique=True, blank=True)
    sku = models.CharField(max_length=100, unique=True, verbose_name="SKU")

    description = models.TextField(blank=True)

    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
    )
    brand = models.ForeignKey(
        Brand,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )

    stock_quantity = models.PositiveIntegerField(default=0)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="active")

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} - {self.sku}"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
