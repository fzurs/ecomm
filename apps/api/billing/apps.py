from django.apps import AppConfig


class BillingConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "billing"

    def ready(self):
        from auditlog.registry import auditlog

        from .models import Invoice

        # arca_response repeats what the other fields already say, and is long.
        auditlog.register(Invoice, exclude_fields=["updated_at", "arca_response"])
