import logging

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.test.runner import DiscoverRunner

from accounts.roles import ADMINISTRATION


class TestRunner(DiscoverRunner):
    """Keeps the INFO logs of emissions and logins (LOGGING) out of the test output. assertLogs
    still sees them: it lowers the level while it runs."""

    def setup_test_environment(self, **kwargs):
        super().setup_test_environment(**kwargs)
        for name in ('billing', 'audit'):
            logging.getLogger(name).setLevel(logging.ERROR)


def make_staff(username='admin', role=ADMINISTRATION, **fields):
    """An admin account like the real ones: staff in a role, not a superuser."""
    user = get_user_model().objects.create(username=username, is_staff=True, **fields)
    if role:
        user.groups.add(Group.objects.get(name=role))
    return user
