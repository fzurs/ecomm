from dj_rest_auth.serializers import LoginSerializer as BaseLoginSerializer
from dj_rest_auth.serializers import UserDetailsSerializer as BaseUserDetailsSerializer
from django.conf import settings
from rest_framework import serializers

from . import otp

WRONG_CREDENTIALS = 'Wrong username or password.'
CODE_REQUIRED = 'Enter the code from your authenticator app, or a backup code.'
INVALID_CODE = "That code didn't work. Enter the one your app shows now, or a backup code."


class LoginSerializer(BaseLoginSerializer):
    """With 2FA on, a login without `otp_code` fails on that field (CODE_REQUIRED): the admin
    asks for it and sends everything again."""

    otp_code = serializers.CharField(required=False, allow_blank=True, write_only=True)

    def validate(self, attrs):
        # dj-rest-auth's own validate, with our message. Its email verification step only runs
        # with allauth registration, which isn't installed. Inactive users don't authenticate
        # (ModelBackend), so they get the same message: it doesn't say which accounts exist.
        user = self.get_auth_user(attrs.get('username'), attrs.get('email'), attrs.get('password'))
        if not user:
            raise serializers.ValidationError(WRONG_CREDENTIALS)
        self.validate_auth_user_status(user)
        attrs['user'] = user
        if otp.enabled(user):
            code = attrs.get('otp_code')
            if not code:
                raise serializers.ValidationError({'otp_code': [CODE_REQUIRED]})
            attrs['otp_device'] = otp.verify(user, code)
            if attrs['otp_device'] is None:
                raise serializers.ValidationError({'otp_code': [INVALID_CODE]})
        return attrs


class UserDetailsSerializer(BaseUserDetailsSerializer):
    """The logged-in user, with their staff status and permissions ("app.codename"), which say
    what the admin shows, and where they stand with 2FA. All of them are read-only."""

    permissions = serializers.SerializerMethodField()
    otp_enabled = serializers.SerializerMethodField(help_text='2FA is on for the account.')
    otp_verified = serializers.SerializerMethodField(
        help_text='This session passed the second factor.')
    otp_required = serializers.SerializerMethodField(
        help_text='The API refuses staff sessions that did not pass the second factor.')

    class Meta(BaseUserDetailsSerializer.Meta):
        extra = ['is_staff', 'permissions', 'otp_enabled', 'otp_verified', 'otp_required']
        fields = [*BaseUserDetailsSerializer.Meta.fields, *extra]
        read_only_fields = [*BaseUserDetailsSerializer.Meta.read_only_fields, *extra]

    def get_permissions(self, user) -> list[str]:
        return sorted(user.get_all_permissions())

    def get_otp_enabled(self, user) -> bool:
        return otp.enabled(user)

    def get_otp_verified(self, user) -> bool:
        return self.context['request'].user.is_verified()

    def get_otp_required(self, user) -> bool:
        return settings.REQUIRE_2FA


class TwoFactorSetupSerializer(serializers.Serializer):
    otpauth_url = serializers.CharField(help_text='What the QR code holds, to type it by hand.')
    qr_svg = serializers.CharField(help_text='The QR code to scan, as an inline SVG.')


class OtpCodeSerializer(serializers.Serializer):
    otp_code = serializers.CharField()


class BackupCodesSerializer(serializers.Serializer):
    backup_codes = serializers.ListField(child=serializers.CharField())


class TwoFactorDisableSerializer(OtpCodeSerializer):
    password = serializers.CharField(style={'input_type': 'password'})
