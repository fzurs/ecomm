from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import serializers

from .mfa import is_mfa_enabled, passed_mfa


class UserDetailsSerializer(serializers.ModelSerializer):
    """The logged-in user, with their staff status and permissions ("app.codename"), which say
    what the admin shows, and where they stand with 2FA. All of them are read-only."""

    permissions = serializers.SerializerMethodField()
    mfa_enabled = serializers.SerializerMethodField(help_text='2FA is on for the account.')
    mfa_verified = serializers.SerializerMethodField(
        help_text='This session passed the second factor.')
    mfa_required = serializers.SerializerMethodField(
        help_text='The API refuses staff sessions that did not pass the second factor.')

    class Meta:
        model = get_user_model()
        fields = [
            'pk', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'permissions',
            'mfa_enabled', 'mfa_verified', 'mfa_required',
        ]
        read_only_fields = fields

    def get_permissions(self, user) -> list[str]:
        return sorted(user.get_all_permissions())

    def get_mfa_enabled(self, user) -> bool:
        return is_mfa_enabled(user)

    def get_mfa_verified(self, user) -> bool:
        return passed_mfa(self.context['request'])

    def get_mfa_required(self, user) -> bool:
        return settings.REQUIRE_2FA
