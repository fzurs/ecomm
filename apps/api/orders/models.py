from django.conf import settings
from django.core.files.base import ContentFile
from django.utils.translation import gettext_lazy as _
from django.utils.text import slugify
from django.db import models, transaction
from django.utils import timezone
from shipping.models import Province
from store.images import generate_customer_image, to_png
from store.models import Product, VatRate


class Customer(models.Model):
    # ARCA document type codes (the values are what WSFE expects as DocTipo).
    class DocumentType(models.IntegerChoices):
        # Tax IDs
        CUIT = 80, _("CUIT")
        CUIL = 86, _("CUIL")
        CDI = 87, _("CDI")
        # National IDs
        DNI = 96, _("DNI")
        LE = 89, _("LE")
        LC = 90, _("LC")
        # Foreigners and others
        PASSPORT = 94, _("Pasaporte")
        CI_FOREIGN = 91, _("CI Extranjera")
        CI_FEDERAL_POLICE = 0, _("CI Policía Federal")
        MIGRATION_CERTIFICATE = 30, _("Certificado de Migración")

    # ARCA's "condición frente al IVA del receptor" (`arca_client.CondicionIVAReceptor`): it
    # decides the invoice letter.
    class VatCondition(models.IntegerChoices):
        REGISTERED = 1, _("IVA Responsable Inscripto")
        EXEMPT = 4, _("IVA Sujeto Exento")
        FINAL_CONSUMER = 5, _("Consumidor Final")
        MONOTRIBUTO = 6, _("Responsable Monotributo")
        NOT_CATEGORIZED = 7, _("Sujeto No Categorizado")
        FOREIGN_SUPPLIER = 8, _("Proveedor del Exterior")
        FOREIGN_CUSTOMER = 9, _("Cliente del Exterior")
        LIBERATED_LAW_19640 = 10, _("IVA Liberado - Ley N° 19.640")
        SOCIAL_MONOTRIBUTO = 13, _("Monotributista Social")
        NOT_REACHED = 15, _("IVA No Alcanzado")
        PROMOTED_INDEPENDENT_WORKER = 16, _("Monotributo Trabajador Independiente Promovido")

    # Not unique: the store's checkout creates a customer per guest purchase, and two people can
    # share a name.
    name = models.CharField(max_length=255)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    document_type = models.PositiveSmallIntegerField(
        choices=DocumentType.choices, default=DocumentType.CUIT)
    document_number = models.CharField(max_length=20, blank=True, null=True)
    vat_condition = models.PositiveSmallIntegerField(
        choices=VatCondition.choices, default=VatCondition.FINAL_CONSUMER)
    # Razón social and domicilio, as they go on the invoice. An empty legal_name means `name`.
    legal_name = models.CharField(max_length=255, blank=True)
    address = models.CharField(max_length=255, blank=True)
    image = models.ImageField(upload_to="customers/", blank=True, null=True)
    # The store account this customer buys with, if any: a guest's purchase has none.
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, models.SET_NULL, null=True, blank=True, related_name="customer")

    def save(self, *args, **kwargs):
        if not self.image:
            image = generate_customer_image(self.name)
            self.image.save(f"{slugify(self.name)}.png", ContentFile(to_png(image)), save=False)
        super().save(*args, **kwargs)

    @property
    def invoice_name(self):
        return self.legal_name or self.name

    def __str__(self): return self.name


class OrderManager(models.Manager):
    @transaction.atomic
    def create_with_items(self, *, items, reserve=False, **order_data):
        """The order and its items. With `reserve` (a sale: the store's checkout, the admin) it
        takes their stock, or raises `stock.OutOfStock`; a cancelled one takes nothing."""
        from .stock import reserve as reserve_stock

        order = self.create(**order_data)
        for item in items:
            OrderItem.objects.create(**item, order=order)
        if reserve and order.status != Order.Status.CANCELLED:
            reserve_stock(order)
        return order


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', _('Pending')
        PAID = 'paid', _('Paid')
        SHIPPED = 'shipped', _('Shipped')
        DELIVERED = 'delivered', _('Delivered')
        CANCELLED = 'cancelled', _('Cancelled')

    class ShippingMethod(models.TextChoices):
        DELIVERY = 'delivery', _('Delivery')
        PICKUP = 'pickup', _('Pickup')

    # Charged: what can be invoiced.
    PAID_STATUSES = [Status.PAID, Status.SHIPPED, Status.DELIVERED]

    number =models.CharField(max_length=20, unique=True, editable=False)

    customer = models.ForeignKey(
        Customer, on_delete=models.PROTECT, related_name='orders')

    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING, blank=True)
    # How and where it goes, and what that costs (IVA included, copied when it's placed like the
    # prices). Empty in the orders the admin creates by hand.
    shipping_method = models.CharField(max_length=20, choices=ShippingMethod.choices, blank=True)
    shipping_province = models.CharField(max_length=30, choices=Province.choices, blank=True)
    shipping_address = models.TextField(blank=True)
    shipping_cost = models.PositiveIntegerField(default=0)
    # Filled in by hand when it ships: there's no carrier integration.
    carrier = models.CharField(max_length=100, blank=True)
    tracking_number = models.CharField(max_length=100, blank=True)
    # When it shipped and was delivered: the "botón de arrepentimiento" counts from delivery.
    shipped_at = models.DateTimeField(null=True, blank=True, editable=False)
    delivered_at = models.DateTimeField(null=True, blank=True, editable=False)
    # Its items' units are taken from the products' stock (`orders.stock`): it gives them back
    # when it's cancelled only if it took them.
    stock_reserved = models.BooleanField(default=False, editable=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = OrderManager()

    @property
    def items_subtotal(self):
        return sum(item.subtotal for item in self.items.all())

    @property
    def total(self):
        return self.items_subtotal + self.shipping_cost

    def stamp_status(self) -> list[str]:
        """Sets `shipped_at` / `delivered_at` the first time the status gets there; the fields
        it set."""
        stamped = []
        if self.status in (self.Status.SHIPPED, self.Status.DELIVERED) and not self.shipped_at:
            self.shipped_at = timezone.now()
            stamped.append('shipped_at')
        if self.status == self.Status.DELIVERED and not self.delivered_at:
            self.delivered_at = timezone.now()
            stamped.append('delivered_at')
        return stamped

    def save(self, *args, **kwargs):
        stamped = self.stamp_status()
        if stamped and kwargs.get('update_fields') is not None:
            kwargs['update_fields'] = [*kwargs['update_fields'], *stamped]
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
    # Copied from the product, like unit_price: the invoice uses the rate of the sale.
    vat_rate = models.PositiveSmallIntegerField(choices=VatRate.choices, blank=True)

    @property
    def subtotal(self):
        return self.unit_price * self.quantity

    def save(self, *args, **kwargs):
        if self._state.adding and not self.unit_price:
            self.unit_price = self.product.active_price
        if self._state.adding and not self.vat_rate:
            self.vat_rate = self.product.vat_rate
        return super().save(*args, **kwargs)

    def __str__(self):
        return f"Order #{self.order_id} - {self.quantity} × {self.product}"
