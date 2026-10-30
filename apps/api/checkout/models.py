from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from store.models import Product

MAX_QUANTITY = 99


class Cart(models.Model):
    """What a visitor of the store is about to buy. A guest's cart is in their session
    (`services.SESSION_KEY`); a customer's belongs to their account, and logging in hands the
    guest's to it (`services.merge_guest_cart`)."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, models.CASCADE, null=True, blank=True, related_name="cart")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Cart #{self.pk} ({self.user or 'guest'})"


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, models.CASCADE, related_name="+")
    quantity = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(MAX_QUANTITY)])
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["added_at", "pk"]
        constraints = [
            models.UniqueConstraint(fields=["cart", "product"], name="cart_item_unique_product"),
        ]

    def __str__(self):
        return f"{self.quantity} × {self.product}"
