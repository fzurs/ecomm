from django.conf import settings
from rest_framework.exceptions import NotFound
from rest_framework.permissions import BasePermission, DjangoModelPermissions

from accounts.mfa import passed_mfa

TWO_FACTOR_REQUIRED = 'Two-factor authentication required.'


def is_verified_staff(permission, request) -> bool:
    """Staff, and past the second factor when REQUIRE_2FA (`accounts.mfa.passed_mfa`)."""
    user = request.user
    if not (user and user.is_staff):
        return False
    if settings.REQUIRE_2FA and not passed_mfa(request):
        permission.message = TWO_FACTOR_REQUIRED
        return False
    return True


class IsVerifiedStaff(BasePermission):
    def has_permission(self, request, view):
        return is_verified_staff(self, request)


class StoreEnabled(BasePermission):
    """The store's public endpoints (cart, checkout, its orders, Mercado Pago's webhook, the
    revocation button), for anybody. Without the store (STORE_ENABLED=false) they don't exist:
    the admin's /api forwards everything to Django, and they'd be reachable through it."""

    def has_permission(self, request, view):
        if not settings.STORE_ENABLED:
            raise NotFound
        return True


class StaffModelPermissions(DjangoModelPermissions):
    """The default: verified staff (see `is_verified_staff`), with the model permission of the
    method. Unlike DRF's, reading needs `view_<model>` too. Custom actions follow their method:
    a POST action needs `add`."""

    perms_map = {
        **DjangoModelPermissions.perms_map,
        'GET': ['%(app_label)s.view_%(model_name)s'],
        'HEAD': ['%(app_label)s.view_%(model_name)s'],
    }

    def has_permission(self, request, view):
        return is_verified_staff(self, request) and super().has_permission(request, view)
