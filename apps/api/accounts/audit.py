"""Security events to the `audit` logger: logins, logouts and failed logins, with where they came
from. Data changes, with who made them, are auditlog's LogEntry (registered in each app's
`ready`)."""
import logging

from django.contrib.auth.signals import user_logged_in, user_logged_out, user_login_failed
from django.dispatch import receiver

from .mfa import passed_mfa

audit = logging.getLogger('audit')


def origin(request) -> str:
    if request is None:
        return 'no request'
    # REMOTE_ADDR: behind a proxy, the proxy's address unless it rewrites it.
    return f"{request.META.get('REMOTE_ADDR', '?')} ({request.META.get('HTTP_USER_AGENT', '?')})"


@receiver(user_logged_in)
def logged_in(sender, request, user, **kwargs):
    second_factor = ' with 2FA' if passed_mfa(request, user) else ''
    audit.info('login: %s%s from %s', user, second_factor, origin(request))


@receiver(user_logged_out)
def logged_out(sender, request, user, **kwargs):
    audit.info('logout: %s from %s', user, origin(request))


@receiver(user_login_failed)
def login_failed(sender, credentials, request=None, **kwargs):
    # Django already masks the password in `credentials`.
    audit.warning('login failed: %s from %s', credentials.get('username', '?'), origin(request))
