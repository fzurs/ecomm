import getpass
import logging

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.management.base import BaseCommand, CommandError

from accounts.roles import ADMINISTRATION, role_permissions

audit = logging.getLogger('audit')


class Command(BaseCommand):
    help = 'Creates a personal staff account for the admin, in a role, without superuser.'

    def add_arguments(self, parser):
        parser.add_argument('username')
        parser.add_argument('--email', default='')
        parser.add_argument('--role', default=ADMINISTRATION, choices=list(role_permissions()))

    def handle(self, *args, username, email, role, **options):
        User = get_user_model()
        if User.objects.filter(username=username).exists():
            raise CommandError(f'User "{username}" already exists.')
        user = User(username=username, email=email, is_staff=True)

        password = getpass.getpass('Password: ')
        if password != getpass.getpass('Password (again): '):
            raise CommandError("Passwords don't match.")
        try:
            validate_password(password, user)
        except ValidationError as e:
            raise CommandError(' '.join(e.messages))
        user.set_password(password)
        user.save()
        user.groups.add(Group.objects.get(name=role))

        audit.info('create_operator: %s (%s) by OS user %s', username, role, getpass.getuser())
        self.stdout.write(f'Created {username} ({role}).')
