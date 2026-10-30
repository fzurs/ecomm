from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction
from django.template.loader import render_to_string

from orders.models import Customer, Order
from store.models import Product

from .models import MAX_QUANTITY, Cart, CartItem

# The session's keys: the guest's cart, and the orders they placed (to show them again).
SESSION_KEY = "cart_id"
PLACED_ORDERS_KEY = "placed_orders"


def is_purchasable(product: Product) -> bool:
    """For sale and with a price: out of stock, drafts and the rest can't be bought."""
    return product.status == Product.Status.ACTIVE and bool(product.price)


def get_cart(request, create=False) -> Cart | None:
    """The visitor's cart: their account's, or the guest's in the session. With `create`, a new
    one if they have none."""
    if request.user.is_authenticated:
        if create:
            return Cart.objects.get_or_create(user=request.user)[0]
        return Cart.objects.filter(user=request.user).first()

    cart_id = request.session.get(SESSION_KEY)
    cart = Cart.objects.filter(pk=cart_id, user=None).first() if cart_id else None
    if cart is None and create:
        cart = Cart.objects.create()
        request.session[SESSION_KEY] = cart.pk
        # The cart outlives the browser, like a customer's session (8 hours otherwise).
        request.session.set_expiry(settings.CUSTOMER_SESSION_AGE)
    return cart


def add_item(cart: Cart, product: Product, quantity: int) -> CartItem:
    """Adds `quantity` to what the cart has of `product`, up to MAX_QUANTITY."""
    item, created = CartItem.objects.get_or_create(
        cart=cart, product=product, defaults={"quantity": min(quantity, MAX_QUANTITY)})
    if not created:
        item.quantity = min(item.quantity + quantity, MAX_QUANTITY)
        item.save(update_fields=["quantity"])
    cart.save(update_fields=["updated_at"])
    return item


def merge_guest_cart(request, user):
    """On login: the guest's cart becomes the account's, or joins it if it has one."""
    if request is None or not hasattr(request, "session"):
        return
    cart_id = request.session.pop(SESSION_KEY, None)
    guest = Cart.objects.filter(pk=cart_id, user=None).first() if cart_id else None
    if guest is None:
        return
    with transaction.atomic():
        own = Cart.objects.filter(user=user).first()
        if own is None:
            guest.user = user
            guest.save(update_fields=["user", "updated_at"])
            return
        for item in guest.items.select_related("product"):
            add_item(own, item.product, item.quantity)
        guest.delete()


class EmptyCart(Exception):
    pass


class UnavailableProducts(Exception):
    def __init__(self, names):
        super().__init__(names)
        self.names = names


@transaction.atomic
def place_order(request, cart: Cart | None, customer_data: dict, shipping_address: str) -> Order:
    """Turns the cart into a pending order of the visitor's customer, and empties it. Prices are
    the ones of now (OrderItem copies them). The customer gets an email; a guest can see the
    order again in this session."""
    items = list(cart.items.select_related("product")) if cart else []
    if not items:
        raise EmptyCart()
    unavailable = [item.product.name for item in items if not is_purchasable(item.product)]
    if unavailable:
        raise UnavailableProducts(unavailable)

    order = Order.objects.create_with_items(
        customer=customer_for(request.user, customer_data),
        shipping_address=shipping_address,
        items=[{"product": item.product, "quantity": item.quantity} for item in items],
    )
    cart.items.all().delete()

    if not request.user.is_authenticated:
        request.session[PLACED_ORDERS_KEY] = [*request.session.get(PLACED_ORDERS_KEY, []), order.number]
    transaction.on_commit(lambda: send_order_placed_email(order))
    return order


def customer_for(user, data: dict) -> Customer:
    """A customer's account keeps one Customer, updated with what each checkout says (invoices
    keep their own copy). A guest gets a new one per purchase: an email typed at checkout
    proves nothing, so it never joins someone else's."""
    if user.is_authenticated:
        customer = Customer.objects.filter(user=user).first()
        if customer is not None:
            for field, value in data.items():
                setattr(customer, field, value)
            customer.save()
            return customer
        return Customer.objects.create(**data, user=user)
    return Customer.objects.create(**data)


def send_order_placed_email(order: Order):
    context = {
        "order": order,
        "items": order.items.select_related("product"),
        "store_name": settings.STORE_NAME,
        "order_url": f"{settings.STORE_URL}/orders/{order.number}",
    }
    send_mail(
        f"{settings.ACCOUNT_EMAIL_SUBJECT_PREFIX}Order {order.number} received",
        render_to_string("checkout/order_placed.txt", context),
        None,
        [order.customer.email],
    )
