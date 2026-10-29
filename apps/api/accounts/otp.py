"""Two-factor authentication (TOTP, with backup codes) on top of django-otp."""
import logging

from django.db import transaction
from django_otp import user_has_device
from django_otp.plugins.otp_static.models import StaticDevice, StaticToken
from django_otp.plugins.otp_totp.models import TOTPDevice

audit = logging.getLogger('audit')

BACKUP_CODES = 10


def enabled(user) -> bool:
    return user_has_device(user, confirmed=True)


def verify(user, code: str):
    """The confirmed device that accepts `code`, or None: an authenticator code (6 digits) or a
    backup code (8 letters and digits), which is used up. Each goes only to its own device, so
    a backup code doesn't count as a failed authenticator code: django-otp throttles each
    device after failures."""
    code = code.replace(' ', '').lower()
    model = TOTPDevice if code.isdigit() else StaticDevice
    with transaction.atomic():
        for device in model.objects.devices_for_user(user, confirmed=True).select_for_update():
            if device.verify_token(code):
                if model is StaticDevice:
                    audit.info('2fa: %s used a backup code (%d left)', user, device.token_set.count())
                return device
    return None


def start_setup(user) -> TOTPDevice:
    """A new, unconfirmed authenticator. A previous unconfirmed one is dropped."""
    TOTPDevice.objects.filter(user=user, confirmed=False).delete()
    return TOTPDevice.objects.create(user=user, name='Authenticator', confirmed=False)


def confirm_setup(device: TOTPDevice) -> list[str]:
    """Turns 2FA on with `device` and returns new backup codes, shown only once."""
    with transaction.atomic():
        device.confirmed = True
        device.save(update_fields=['confirmed'])
        StaticDevice.objects.filter(user=device.user).delete()
        backup = StaticDevice.objects.create(user=device.user, name='Backup codes')
        codes = [StaticToken.random_token() for _ in range(BACKUP_CODES)]
        StaticToken.objects.bulk_create(StaticToken(device=backup, token=code) for code in codes)
    audit.info('2fa: %s turned it on', device.user)
    return codes


def disable(user) -> None:
    TOTPDevice.objects.filter(user=user).delete()
    StaticDevice.objects.filter(user=user).delete()
    audit.info('2fa: %s turned it off', user)
