from types import SimpleNamespace
from urllib.parse import urlparse

from allauth.account.adapter import DefaultAccountAdapter
from allauth.account.models import EmailAddress
from allauth.account.stages import EmailVerificationStage
from allauth.core import context
from allauth.mfa.adapter import DefaultMFAAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.conf import settings
from django.contrib.auth import get_user_model


class CustomerEmailVerificationStage(EmailVerificationStage):
    """Customers confirm their email before logging in. Staff accounts are created on the server
    (create_operator), often without one: they log in with their username and the second factor."""

    def handle(self):
        if self.login.user and self.login.user.is_staff:
            return None, True
        return super().handle()


class AccountAdapter(DefaultAccountAdapter):
    def get_login_stages(self):
        return [
            'accounts.adapter.CustomerEmailVerificationStage'
            if stage == 'allauth.account.stages.EmailVerificationStage' else stage
            for stage in super().get_login_stages()
        ]

    def login(self, request, user):
        super().login(request, user)
        # Customers stay logged in on the store, also after closing the browser. Staff keep the
        # settings' session: a working day, gone with the browser.
        if not user.is_staff:
            request.session.set_expiry(settings.CUSTOMER_SESSION_AGE)
        else:
            # The session may come from a guest's cart, with the customers' age: logging in
            # keeps it, so it goes back to the settings'.
            request.session.set_expiry(None)

    def clean_password(self, password, user=None):
        # Signing up validates without a user, and only customers sign up: without one, the
        # validators would take the staff's minimum (accounts.validators).
        if user is None:
            user = get_user_model()(is_staff=False)
        return super().clean_password(password, user=user)

    def send_mail(self, template_prefix, email, context):
        # The emails speak for the store. Without django.contrib.sites allauth would sign them
        # with the request's host: the API's, which Next forwards to.
        store = SimpleNamespace(name=settings.STORE_NAME, domain=urlparse(settings.STORE_URL).netloc)
        super().send_mail(template_prefix, email, {**context, 'current_site': store})


class SocialAccountAdapter(DefaultSocialAccountAdapter):
    def authenticate_by_email(self, sociallogin):
        """A Google login with the email of an existing account logs into it only if that account
        confirmed the email, and isn't staff: staff log in through the admin, with their second
        factor."""
        for email in [address.email for address in sociallogin.email_addresses if address.verified]:
            if not self.can_authenticate_by_email(sociallogin, email):
                continue
            address = (
                EmailAddress.objects.filter(email__iexact=email, verified=True, user__is_active=True)
                .select_related('user').first())
            if address and not address.user.is_staff:
                return address.user, address.email
        return None


def frontend_host(request) -> str | None:
    """The frontend's host the request came through: Next's rewrite of /api sends it as
    X-Forwarded-Host. Only a host of FRONTEND_ORIGINS counts, so a request straight to the API
    can't pick it."""
    forwarded = request.headers.get('X-Forwarded-Host', '').split(',')[0].strip()
    host = forwarded.partition(':')[0]
    trusted = {urlparse(origin).hostname for origin in settings.FRONTEND_ORIGINS}
    return host if host in trusted else None


class MFAAdapter(DefaultMFAAdapter):
    def get_public_key_credential_rp_entity(self):
        # A passkey belongs to the domain the browser is on: the admin's (or the store's), not
        # the API host Next forwards to, which is what allauth would read from the request.
        rp = super().get_public_key_credential_rp_entity()
        rp['id'] = frontend_host(context.request) or rp['id']
        # What the browser shows when creating it: the name authenticator apps show too.
        rp['name'] = settings.MFA_TOTP_ISSUER
        return rp
