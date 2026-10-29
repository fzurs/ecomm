import io
from unittest import mock

from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core.management import CommandError, call_command
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from config.testing import make_staff

from .roles import ADMINISTRATION, INVOICING, READ_ONLY, sync_roles

User = get_user_model()


class PermissionTests(APITestCase):
    def status_of(self, method, name, data=None, **kwargs):
        return getattr(self.client, method)(reverse(name, **kwargs), data, format='json').status_code

    def test_logged_in_but_not_staff_gets_nothing(self):
        self.client.force_login(User.objects.create(username='cliente'))
        self.assertEqual(self.status_of('get', 'order-list'), status.HTTP_403_FORBIDDEN)
        self.assertEqual(self.status_of('get', 'invoice-list'), status.HTTP_403_FORBIDDEN)

    def test_staff_without_a_role_gets_nothing(self):
        self.client.force_login(make_staff(role=None))
        self.assertEqual(self.status_of('get', 'customer-list'), status.HTTP_403_FORBIDDEN)

    def test_read_only_reads_but_does_not_write(self):
        self.client.force_login(make_staff(role=READ_ONLY))
        self.assertEqual(self.status_of('get', 'order-list'), status.HTTP_200_OK)
        self.assertEqual(self.status_of('get', 'invoice-list'), status.HTTP_200_OK)
        self.assertEqual(self.status_of('post', 'customer-list', {}), status.HTTP_403_FORBIDDEN)
        self.assertEqual(self.status_of('post', 'invoice-preview', {}), status.HTTP_403_FORBIDDEN)

    def test_invoicing_emits_but_does_not_edit_the_catalog(self):
        self.client.force_login(make_staff(role=INVOICING))
        # Past the permission check: the empty body is what fails.
        self.assertEqual(self.status_of('post', 'invoice-preview', {}), status.HTTP_400_BAD_REQUEST)
        self.assertEqual(self.status_of('post', 'customer-list', {}), status.HTTP_403_FORBIDDEN)
        self.assertEqual(self.status_of('post', 'product-list', {}), status.HTTP_403_FORBIDDEN)

    def test_administration_writes(self):
        self.client.force_login(make_staff())
        self.assertEqual(self.status_of('post', 'brand-list', {'name': 'ACME'}), status.HTTP_201_CREATED)

    def test_the_store_still_reads_without_a_session(self):
        self.assertEqual(self.status_of('get', 'product-list'), status.HTTP_200_OK)


class UserDetailsTests(APITestCase):
    def test_exposes_staff_and_permissions_read_only(self):
        user = make_staff(role=INVOICING)
        self.client.force_login(user)

        data = self.client.get(reverse('rest_user_details')).json()
        self.assertTrue(data['is_staff'])
        self.assertIn('billing.add_invoice', data['permissions'])
        self.assertNotIn('orders.add_customer', data['permissions'])

        self.client.patch(reverse('rest_user_details'), {'is_staff': False, 'permissions': []}, format='json')
        user.refresh_from_db()
        self.assertTrue(user.is_staff)


class RolesTests(TestCase):
    def test_sync_is_idempotent_and_restores_permissions(self):
        group = Group.objects.get(name=READ_ONLY)
        count = group.permissions.count()
        group.permissions.clear()
        sync_roles()
        sync_roles()
        self.assertEqual(group.permissions.count(), count)
        self.assertFalse(group.permissions.exclude(codename__startswith='view_').exists())


class CreateOperatorTests(TestCase):
    def create(self, *args, passwords=('una clave bien larga', 'una clave bien larga')):
        with mock.patch('getpass.getpass', side_effect=passwords):
            call_command('create_operator', *args, stdout=io.StringIO())

    def test_creates_a_staff_account_in_a_role_without_superuser(self):
        with self.assertLogs('audit', 'INFO'):
            self.create('fede')
        user = User.objects.get(username='fede')
        self.assertTrue(user.is_staff)
        self.assertFalse(user.is_superuser)
        self.assertEqual(list(user.groups.values_list('name', flat=True)), [ADMINISTRATION])
        self.assertTrue(user.check_password('una clave bien larga'))

    def test_refuses_a_weak_password(self):
        with self.assertRaises(CommandError):
            self.create('fede', passwords=('corta', 'corta'))
        self.assertFalse(User.objects.filter(username='fede').exists())

    def test_refuses_an_existing_user(self):
        make_staff('fede')
        with self.assertRaisesMessage(CommandError, 'already exists'):
            self.create('fede')
