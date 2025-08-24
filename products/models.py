from django.db import models
from django.utils import timezone


class Category(models.Model):
    name = models.CharField(max_length=150)

    class Meta:
        verbose_name_plural = "categories"

    def __str__(self) -> str:
        return self.name


class Product(models.Model):
    title = models.CharField(max_length=255, unique=True)
    description = models.TextField()
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True)
    is_active = models.BooleanField(default=False)
    price = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    # img = models.ImageField(null=True, blank=True)
    created_at = models.DateTimeField(
        auto_created=True, default=timezone.now())
    updated_at = models.DateTimeField(auto_now=True)
    stock = models.PositiveIntegerField(default=0)

    def __str__(self) -> str:
        return self.title
