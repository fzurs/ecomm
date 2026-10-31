from django.conf import settings
from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from billing.models import Invoice
from billing.rules import InvoicingError, invoice_letter, receptor_for
from orders.models import Customer, Order, OrderItem
from orders.serializers import CustomerSerializer
from payments.models import Payment
from shipping.models import Province
from store.models import Product

from .models import MAX_QUANTITY
from .services import is_purchasable, max_quantity


class CartProductSerializer(serializers.ModelSerializer):
    active_price = serializers.IntegerField(read_only=True, allow_null=True)

    class Meta:
        model = Product
        fields = ["id", "slug", "name", "image", "status", "price", "discount_percent", "active_price"]


class CartItemSerializer(serializers.Serializer):
    product = CartProductSerializer()
    quantity = serializers.IntegerField()
    # False when the product can't be bought anymore (out of stock, no longer for sale) or not
    # as many: it doesn't count in the total, and the checkout asks to take it out or lower it.
    available = serializers.BooleanField()
    # The most the cart can have: the product's stock, up to MAX_QUANTITY. 0 when it ran out.
    max_quantity = serializers.IntegerField()
    subtotal = serializers.IntegerField(allow_null=True)


class CartSerializer(serializers.Serializer):
    items = CartItemSerializer(many=True)
    # Units of the available items, for the header's badge.
    count = serializers.IntegerField()
    total = serializers.IntegerField()

    @staticmethod
    def data_for(cart):
        """The cart as the serializer reads it; an empty one without a cart."""
        items = []
        for item in (cart.items.select_related("product") if cart else []):
            available = is_purchasable(item.product) and item.quantity <= item.product.stock
            items.append({
                "product": item.product,
                "quantity": item.quantity,
                "available": available,
                "max_quantity": max_quantity(item.product) if is_purchasable(item.product) else 0,
                "subtotal": item.product.active_price * item.quantity if available else None,
            })
        available = [item for item in items if item["available"]]
        return {
            "items": items,
            "count": sum(item["quantity"] for item in available),
            "total": sum(item["subtotal"] for item in available),
        }


class CartItemCreateSerializer(serializers.Serializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    quantity = serializers.IntegerField(min_value=1, max_value=MAX_QUANTITY, default=1)

    def validate_product(self, product):
        if not is_purchasable(product):
            raise serializers.ValidationError("This product can't be bought right now.")
        return product


class CartItemUpdateSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1, max_value=MAX_QUANTITY)

    def validate_quantity(self, quantity):
        product = self.context["product"]
        if quantity > product.stock:
            raise serializers.ValidationError(
                f"Only {product.stock} left." if product.stock else "It's out of stock.")
        return quantity


class CheckoutSerializer(CustomerSerializer):
    """Who buys (a Customer, validated like the admin's: CUIT, VAT condition) and how it gets
    to them: sent to a province (and an address) or picked up."""

    SHIPPING_FIELDS = ["shipping_method", "shipping_province", "shipping_address"]

    shipping_method = serializers.ChoiceField(choices=Order.ShippingMethod.choices)
    shipping_province = serializers.ChoiceField(choices=Province.choices, required=False, allow_blank=True)
    shipping_address = serializers.CharField(max_length=500, required=False, allow_blank=True)

    class Meta(CustomerSerializer.Meta):
        fields = ["name", "email", "phone", "document_type", "document_number", "vat_condition",
                  "legal_name", "shipping_method", "shipping_province", "shipping_address"]
        extra_kwargs = {"email": {"required": True, "allow_blank": False}}

    def validate(self, attrs):
        attrs = super().validate(attrs)
        if attrs["shipping_method"] == Order.ShippingMethod.DELIVERY:
            missing = {field: "Required to ship the order."
                       for field in ("shipping_province", "shipping_address") if not attrs.get(field)}
            if missing:
                raise serializers.ValidationError(missing)
        else:
            attrs["shipping_province"], attrs["shipping_address"] = "", ""
        # A paid order is invoiced on its own (payments.services.invoice_order): what the customer
        # gives has to be enough for the invoice, or it'd fail after the payment.
        customer = Customer(**{field: value for field, value in attrs.items()
                               if field not in self.SHIPPING_FIELDS})
        try:
            receptor_for(customer, invoice_letter(customer))
        except InvoicingError as exc:
            raise serializers.ValidationError({"document_number": str(exc)})
        return attrs


class CheckoutResultSerializer(serializers.Serializer):
    number = serializers.CharField()
    # Mercado Pago's checkout, where the store sends the customer. Null if it couldn't be made:
    # the order's page offers to pay it.
    payment_url = serializers.URLField(allow_null=True)


class PaymentLinkSerializer(serializers.Serializer):
    payment_url = serializers.URLField()


class MyOrderItemSerializer(serializers.ModelSerializer):
    product = CartProductSerializer()
    subtotal = serializers.IntegerField()

    class Meta:
        model = OrderItem
        fields = ["product", "quantity", "unit_price", "subtotal"]


class MyOrderCustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ["name", "email"]


class MyOrderSerializer(serializers.ModelSerializer):
    """An order as its customer sees it: no invoice internals nor billing data."""

    items = MyOrderItemSerializer(many=True)
    items_subtotal = serializers.IntegerField()
    total = serializers.IntegerField()
    # Where to pick it up, for a pickup order.
    pickup_address = serializers.SerializerMethodField()
    customer = MyOrderCustomerSerializer()
    # Its last payment's, or null without one: e.g. `in_process` while a cash payment waits.
    payment_status = serializers.SerializerMethodField()
    payment_status_detail = serializers.SerializerMethodField()
    # An authorized invoice, as a PDF at /my/orders/<number>/invoice/.
    has_invoice = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ["number", "status", "created_at", "customer", "shipping_method", "shipping_province",
                  "shipping_address", "shipping_cost", "carrier", "tracking_number", "pickup_address",
                  "items", "items_subtotal", "total", "payment_status", "payment_status_detail",
                  "has_invoice"]

    def get_pickup_address(self, order) -> str | None:
        if order.shipping_method != Order.ShippingMethod.PICKUP:
            return None
        return settings.STORE_PICKUP_ADDRESS or None

    @staticmethod
    def last_payment(order):
        # Prefetched by MyOrderViewSet, newest first.
        payments = list(order.payments.all())
        return payments[0] if payments else None

    @extend_schema_field(serializers.ChoiceField(choices=Payment.Status.choices, allow_null=True))
    def get_payment_status(self, order):
        payment = self.last_payment(order)
        return payment.status if payment else None

    def get_payment_status_detail(self, order) -> str:
        payment = self.last_payment(order)
        return payment.status_detail if payment else ""

    def get_has_invoice(self, order) -> bool:
        return invoice_of(order) is not None


def invoice_of(order):
    """The order's authorized invoice (prefetched by MyOrderViewSet), or None."""
    return next((invoice for invoice in order.invoices.all()
                 if invoice.associated_invoice_id is None
                 and invoice.status == Invoice.Status.AUTHORIZED), None)
