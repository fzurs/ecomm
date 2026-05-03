from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)


class Product(models.Model):
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("active", "Active"),
        ("inactive", "Inactive"),
        ("out_of_stock", "Out of stock"),
        ("discontinued", "Discontinued"),
    ]

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True
    )

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
    price = models.PositiveIntegerField(default=0, blank=True, null=True)
