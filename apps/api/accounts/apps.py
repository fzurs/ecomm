from django.apps import AppConfig
from django.db.models.signals import post_migrate


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'

    def ready(self):
        from auditlog.registry import auditlog
        from django.contrib.auth import get_user_model
        from django.contrib.auth.models import Group

        from . import audit, mfa  # noqa: F401  (connect the login and 2FA signals)
        from .roles import sync_roles

        auditlog.register(
            get_user_model(), exclude_fields=['password', 'last_login'], m2m_fields={'groups'})
        auditlog.register(Group, m2m_fields={'permissions'})

        # After every migrate. accounts goes last in INSTALLED_APPS, so the permissions of the
        # other apps exist by then.
        post_migrate.connect(sync_roles, sender=self)
