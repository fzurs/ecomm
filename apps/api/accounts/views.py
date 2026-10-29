import segno
from dj_rest_auth.views import LoginView as BaseLoginView
from django_otp import login as otp_login
from django_otp.plugins.otp_totp.models import TOTPDevice
from drf_spectacular.utils import extend_schema
from rest_framework import permissions, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from . import otp
from .serializers import (
    INVALID_CODE,
    BackupCodesSerializer,
    OtpCodeSerializer,
    TwoFactorDisableSerializer,
    TwoFactorSetupSerializer,
)


class LoginView(BaseLoginView):
    """dj-rest-auth's login, marking the session as verified when a code was given."""

    def process_login(self):
        # django-otp marks the session on Django's user_logged_in when the user has a device.
        device = self.serializer.validated_data.get('otp_device')
        if device is not None:
            self.user.otp_device = device
        super().process_login()


# Turning 2FA on and off. Staff only, but not verified staff: an account without 2FA has to
# reach these to turn it on.
class TwoFactorSetupView(APIView):
    permission_classes = [permissions.IsAdminUser]

    @extend_schema(operation_id='auth_2fa_setup', request=None, responses=TwoFactorSetupSerializer)
    def post(self, request):
        """Starts turning 2FA on: a new authenticator to scan, confirmed with `confirm`."""
        if otp.enabled(request.user):
            raise ValidationError({'detail': 'Two-factor authentication is already on: turn it off first.'})
        url = otp.start_setup(request.user).config_url
        return Response(TwoFactorSetupSerializer({
            'otpauth_url': url,
            'qr_svg': segno.make(url, error='m').svg_inline(scale=5, border=2),
        }).data)


class TwoFactorConfirmView(APIView):
    permission_classes = [permissions.IsAdminUser]

    @extend_schema(operation_id='auth_2fa_confirm', request=OtpCodeSerializer, responses=BackupCodesSerializer)
    def post(self, request):
        """Turns 2FA on with a code from the new authenticator. Returns the backup codes, which
        are never shown again. The current session counts as verified."""
        serializer = OtpCodeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        device = TOTPDevice.objects.filter(user=request.user, confirmed=False).last()
        if device is None:
            raise ValidationError({'detail': 'Start the setup first.'})
        if not device.verify_token(serializer.validated_data['otp_code'].replace(' ', '')):
            raise ValidationError({'otp_code': [INVALID_CODE]})
        codes = otp.confirm_setup(device)
        otp_login(request, device)
        return Response(BackupCodesSerializer({'backup_codes': codes}).data)


class TwoFactorDisableView(APIView):
    permission_classes = [permissions.IsAdminUser]

    @extend_schema(operation_id='auth_2fa_disable', request=TwoFactorDisableSerializer, responses={204: None})
    def post(self, request):
        """Turns 2FA off, with the password and a code. Where 2FA is required, the session loses
        access until it is turned on again."""
        serializer = TwoFactorDisableSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if not request.user.check_password(serializer.validated_data['password']):
            raise ValidationError({'password': ['Wrong password.']})
        if otp.verify(request.user, serializer.validated_data['otp_code']) is None:
            raise ValidationError({'otp_code': [INVALID_CODE]})
        otp.disable(request.user)
        return Response(status=status.HTTP_204_NO_CONTENT)
