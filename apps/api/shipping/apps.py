from django.apps import AppConfig


class ShippingConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "shipping"

    def ready(self):
        from auditlog.registry import auditlog

        from .models import ShippingZone

        auditlog.register(ShippingZone)
