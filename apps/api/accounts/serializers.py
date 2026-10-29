from dj_rest_auth.serializers import UserDetailsSerializer as BaseUserDetailsSerializer
from rest_framework import serializers


class UserDetailsSerializer(BaseUserDetailsSerializer):
    """The logged-in user, with their staff status and permissions ("app.codename"), which say
    what the admin shows. Both are read-only."""

    permissions = serializers.SerializerMethodField()

    class Meta(BaseUserDetailsSerializer.Meta):
        fields = [*BaseUserDetailsSerializer.Meta.fields, 'is_staff', 'permissions']
        read_only_fields = [*BaseUserDetailsSerializer.Meta.read_only_fields, 'is_staff', 'permissions']

    def get_permissions(self, user) -> list[str]:
        return sorted(user.get_all_permissions())
