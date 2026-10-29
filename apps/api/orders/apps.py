from django.apps import AppConfig


class OrdersConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "orders"

    def ready(self):
        from auditlog.registry import auditlog

        from .models import Customer, Order, OrderItem

        auditlog.register(Customer)
        auditlog.register(Order, exclude_fields=["updated_at"])
        auditlog.register(OrderItem)
