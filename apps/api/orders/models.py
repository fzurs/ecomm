import io
from django.core.files.base import ContentFile
from django.utils.translation import gettext_lazy as _
from django.utils.text import slugify
from django.db import models, transaction
from store.models import Product
from .utils import generate_gradient


class Customer(models.Model):
    class DocumentTypes(models.IntegerChoices):
        CUIT = 80, _("CUIT")
        CUIL = 86, _("CUIL")
        CDI = 87, _("CDI")
        LE = 89, _("LE")
        LC = 90, _("LC")
        DNI = 96, _("DNI")
        PASAPORT = 94, _("Pasaporte")
        CI_FOREIGN = 91, _("CI Extranjera")
        CI_FEDERAL_POLICE = 00, _("CI Policía Federal")
        MIGRATION_CERTIFICATE = 30, _("Certificado de Migración")

    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    document_type = models.PositiveSmallIntegerField(choices=DocumentTypes.choices, default=DocumentTypes.DNI)
    document_number = models.CharField(max_length=20)
    image = models.ImageField(upload_to="customers/", blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.image:
            image = generate_gradient(self.name)

            buffer = io.BytesIO()
            image.save(buffer, format="PNG")

            filename = f"{slugify(self.name)}.png"
            self.image.save(filename, ContentFile(buffer.getvalue()), save=False)

        super().save(*args, **kwargs)

    def __str__(self): return self.name


class OrderManager(models.Manager):
    @transaction.atomic
    def create_with_items(self, *, items, **order_data):
        order = self.create(**order_data)
        for item in items:
            OrderItem.objects.create(**item, order=order)
        return order


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', _('Pending')
        PAID = 'paid', _('Paid')
        SHIPPED = 'shipped', _('Shipped')
        DELIVERED = 'delivered', _('Delivered')
        CANCELLED = 'cancelled', _('Cancelled')

    number = models.CharField(max_length=20, unique=True, editable=False)

    customer = models.ForeignKey(
        Customer, on_delete=models.PROTECT, related_name='orders')

    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = OrderManager()

    @property
    def total(self):
        return sum(item.subtotal for item in self.items.all())

    def save(self, *args, **kwargs):
        if not self.number:
            super().save(*args, **kwargs)
            self.number = f"ORD-{self.pk:06d}"
            super().save(update_fields=["number"])
            return

        super().save(*args, **kwargs)

    def __str__(self):
        return f"Order #{self.pk} - {self.customer} ({self.get_status_display()})"


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
        if self._state.adding and not self.unit_price:
            self.unit_price = self.product.price
        return super().save(*args, **kwargs)

    def __str__(self):
        return f"Order #{self.order_id} - {self.quantity} × {self.product}"
