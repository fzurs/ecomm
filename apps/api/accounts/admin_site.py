from django.contrib.admin import AdminSite

from .mfa import passed_mfa


class MFAAdminSite(AdminSite):
    """The Django admin where 2FA is required: staff whose session passed the second factor. Its
    login form only asks for the password, so such a session comes from the admin app's login on
    the same domain; with the default setup (DJANGO_ADMIN_URL empty in prod) it isn't mounted."""

    def has_permission(self, request):
        return super().has_permission(request) and passed_mfa(request)
