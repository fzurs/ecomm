from django.apps import AppConfig
from django.db.models.signals import post_migrate


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'

    def ready(self):
        from .roles import sync_roles

        # After every migrate. accounts goes last in INSTALLED_APPS, so the permissions of the
        # other apps exist by then.
        post_migrate.connect(sync_roles, sender=self)
