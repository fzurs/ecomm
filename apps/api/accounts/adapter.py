from urllib.parse import urlparse

from allauth.account.adapter import DefaultAccountAdapter
from allauth.core import context
from allauth.mfa.adapter import DefaultMFAAdapter
from django.conf import settings


class AccountAdapter(DefaultAccountAdapter):
    def is_open_for_signup(self, request):
        # Staff accounts are created on the server (create_operator). Customer signup comes with
        # the store's accounts (docs/architecture/auth.md, phase 3).
        return False


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
