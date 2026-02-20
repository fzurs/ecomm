from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=255)


class Product(models.Model):
    STATUS_CHOICES = [
        ("draft", "Draft"),
        ("active", "Active"),
        ("inactive", "Inactive"),
        ("out_of_stock", "Out of stock"),
        ("discontinued", "Discontinued"),
    ]

    name = models.CharField(max_length=255)
    description = models.TextField()
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, blank=True
    )

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="draft")
