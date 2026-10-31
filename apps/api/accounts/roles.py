"""The admin's roles, as Django groups. `sync_roles` (run after every migrate) keeps each group
with exactly these permissions; a new model's permissions are picked up on the next migrate.

Day-to-day accounts are staff in one of these groups, never superusers (`create_operator`).
"""
from django.contrib.auth.models import Group, Permission

ADMINISTRATION = 'Administración'
INVOICING = 'Facturación'
READ_ONLY = 'Solo lectura'

APPS = ['store', 'orders', 'billing', 'shipping', 'revocations']


def _perms(actions, models=None):
    """`app.action_model` for every model of APPS (or only `models`, as "app.model")."""
    queryset = Permission.objects.filter(content_type__app_label__in=APPS)
    if models is not None:
        queryset = queryset.filter(content_type__model__in=[model.split('.')[1] for model in models])
    return [p for p in queryset.select_related('content_type') if p.codename.split('_')[0] in actions]


def role_permissions():
    return {
        ADMINISTRATION: _perms({'view', 'add', 'change', 'delete'}),
        # Creating a voucher emits it: `add_invoice` also covers notes, re-emitting and verifying.
        # Approving a revocation (a POST: `add`) refunds the payment and emits the credit note.
        INVOICING: _perms({'view'}) + _perms({'add'}, ['billing.invoice', 'revocations.revocationrequest']),
        READ_ONLY: _perms({'view'}),
    }


def sync_roles(**kwargs):
    for name, permissions in role_permissions().items():
        group, _ = Group.objects.get_or_create(name=name)
        group.permissions.set(permissions)
