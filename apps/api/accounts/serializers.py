from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import serializers

from assistant.service import is_enabled

from .mfa import is_mfa_enabled, passed_mfa


class UserDetailsSerializer(serializers.ModelSerializer):
    """The logged-in user, with their staff status and permissions ("app.codename"), which say
    what the admin shows, and where they stand with 2FA. Only the name can be changed here: the
    rest of the account (email, password) is allauth's."""

    permissions = serializers.SerializerMethodField()
    mfa_enabled = serializers.SerializerMethodField(help_text='2FA is on for the account.')
    mfa_verified = serializers.SerializerMethodField(
        help_text='This session passed the second factor.')
    mfa_required = serializers.SerializerMethodField(
        help_text='The API refuses staff sessions that did not pass the second factor.')
    has_usable_password = serializers.SerializerMethodField(
        help_text='False for an account created with Google, until it sets a password.')
    assistant_enabled = serializers.SerializerMethodField(
        help_text='The admin assistant can answer (off in production unless turned on).')

    class Meta:
        model = get_user_model()
        fields = [
            'pk', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'permissions',
            'mfa_enabled', 'mfa_verified', 'mfa_required', 'has_usable_password',
            'assistant_enabled',
        ]
        read_only_fields = [field for field in fields if field not in ('first_name', 'last_name')]

    def get_permissions(self, user) -> list[str]:
        return sorted(user.get_all_permissions())

    def get_mfa_enabled(self, user) -> bool:
        return is_mfa_enabled(user)

    def get_mfa_verified(self, user) -> bool:
        return passed_mfa(self.context['request'])

    def get_mfa_required(self, user) -> bool:
        return settings.REQUIRE_2FA

    def get_has_usable_password(self, user) -> bool:
        return user.has_usable_password()

    def get_assistant_enabled(self, user) -> bool:
        return user.is_staff and is_enabled()
