from django.apps import AppConfig


class CheckoutConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "checkout"

    def ready(self):
        from django.contrib.auth.signals import user_logged_in

        from .services import merge_guest_cart

        # A guest who logs in keeps what they put in the cart.
        user_logged_in.connect(
            lambda request, user, **kwargs: merge_guest_cart(request, user),
            dispatch_uid="checkout.merge_guest_cart", weak=False)
