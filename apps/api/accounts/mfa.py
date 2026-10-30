"""Two-factor authentication on top of allauth.mfa: whether a session passed it, which the API
requires of staff when REQUIRE_2FA (config.permissions), and its audit trail."""
import logging

from allauth.account.authentication import get_authentication_records
from allauth.account.internal.flows.login import record_authentication
from allauth.mfa import signals
from allauth.mfa.models import Authenticator
from allauth.mfa.utils import is_mfa_enabled
from django.dispatch import receiver

audit = logging.getLogger('audit')

__all__ = ['is_mfa_enabled', 'passed_mfa']


def passed_mfa(request, user=None) -> bool:
    """Whether this session authenticated `user` (by default, the request's) with a second
    factor: at login, or by turning 2FA on."""
    return any(
        record.get('method') == 'mfa'
        for record in get_authentication_records(request, user or request.user))


@receiver(signals.authenticator_added)
def added(sender, request, user, authenticator, **kwargs):
    if authenticator.type == Authenticator.Type.TOTP:
        # Turning it on takes a code from the new authenticator: that counts as passing it, so a
        # staff session that had to set it up gets in without logging in again. (allauth's own
        # record of it, as `mfa/base/internal/flows.py` writes at login.)
        record_authentication(request, user, 'mfa', type=authenticator.type)
    audit.info('2fa: %s added %s', user, authenticator.type)


@receiver(signals.authenticator_removed)
def removed(sender, request, user, authenticator, **kwargs):
    audit.info('2fa: %s removed %s', user, authenticator.type)


@receiver(signals.authenticator_reset)
def reset(sender, request, user, authenticator, **kwargs):
    audit.info('2fa: %s regenerated %s', user, authenticator.type)


@receiver(signals.authenticator_used)
def used(sender, request, user, authenticator, **kwargs):
    if authenticator.type == Authenticator.Type.RECOVERY_CODES:
        audit.info('2fa: %s used a recovery code', user)


@receiver(signals.authentication_failed)
def failed(sender, request, user, authenticator, **kwargs):
    audit.warning('2fa: wrong code for %s', user)
