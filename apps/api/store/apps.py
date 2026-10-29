from django.apps import AppConfig


class StoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'store'

    def ready(self):
        from auditlog.registry import auditlog

        from .models import Brand, Category, Product

        # Who changed what (see accounts/audit.py): auditlog's LogEntry, with the request's user.
        for model in (Brand, Category, Product):
            auditlog.register(model)
