from django.utils.translation import gettext_lazy as _
from django.db import models
from store.models import Product
from django.contrib.auth import get_user_model

UserModel = get_user_model()


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', _('Pending')
        PAID = 'paid', _('Paid')
        SHIPPED = 'shipped', _('Shipped')
        DELIVERED = 'delivered', _('Delivered')
        CANCELLED = 'cancelled', _('Cancelled')

    customer = models.ForeignKey(
        UserModel, on_delete=models.PROTECT, related_name='orders')

    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def total(self):
        return sum(item.subtotal for item in self.items.all())

    def __str__(self):
        return f'Order {self.pk} - {self.customer}'


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(
        Product, on_delete=models.PROTECT, related_name='order_items')
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.PositiveIntegerField(blank=True)

    @property
    def subtotal(self):
        return self.unit_price * self.quantity

    def save(self, *args, **kwargs):
        self.unit_price = self.product.price
        return super().save(*args, **kwargs)

    def __str__(self):
        return f'Order Item - {self.quantity} x {self.product.name}'
