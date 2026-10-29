import io
import time
from unittest import mock

from auditlog.models import LogEntry
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core.management import CommandError, call_command
from django.test import TestCase, override_settings
from django_otp.oath import TOTP
from django_otp.plugins.otp_totp.models import TOTPDevice
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from config.testing import make_staff
from orders.models import Customer

from . import otp
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


def current_code(device: TOTPDevice) -> str:
    totp = TOTP(device.bin_key, device.step, device.t0, device.digits, device.drift)
    totp.time = time.time()
    return f'{totp.token():0{device.digits}d}'


# Throttling (a growing wait after each wrong code) would refuse the right code that follows a
# wrong one; test_wrong_codes_are_throttled turns it back on.
@override_settings(OTP_TOTP_THROTTLE_FACTOR=0, OTP_STATIC_THROTTLE_FACTOR=0)
class TwoFactorTests(APITestCase):
    password = 'una clave bien larga'

    def setUp(self):
        self.user = make_staff()
        self.user.set_password(self.password)
        self.user.save()

    def enable(self):
        """2FA on, as if set up from the admin: (device, backup codes)."""
        device = otp.start_setup(self.user)
        return device, otp.confirm_setup(device)

    def login(self, **data):
        return self.client.post(
            reverse('rest_login'), {'username': 'admin', 'password': self.password, **data}, format='json')

    def me(self):
        return self.client.get(reverse('rest_user_details')).json()

    def test_login_without_2fa_is_unchanged(self):
        self.assertEqual(self.login().status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(self.me()['otp_enabled'])

    def test_login_with_2fa_asks_for_the_code(self):
        device, _ = self.enable()

        response = self.login()
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('otp_code', response.json())
        self.assertEqual(self.client.get(reverse('rest_user_details')).status_code, status.HTTP_403_FORBIDDEN)

        self.assertEqual(self.login(otp_code='000000').json()['otp_code'], ['Invalid code.'])

        self.assertEqual(self.login(otp_code=current_code(device)).status_code, status.HTTP_204_NO_CONTENT)
        me = self.me()
        self.assertTrue(me['otp_enabled'])
        self.assertTrue(me['otp_verified'])

    def test_a_backup_code_works_once(self):
        _, codes = self.enable()
        self.assertEqual(len(codes), otp.BACKUP_CODES)
        with self.assertLogs('audit', 'INFO'):
            self.assertEqual(self.login(otp_code=codes[0]).status_code, status.HTTP_204_NO_CONTENT)
        self.client.logout()
        self.assertEqual(self.login(otp_code=codes[0]).status_code, status.HTTP_400_BAD_REQUEST)

    @override_settings(OTP_TOTP_THROTTLE_FACTOR=1)
    def test_wrong_codes_are_throttled(self):
        device, codes = self.enable()
        self.login(otp_code='000000')
        self.assertEqual(self.login(otp_code=current_code(device)).status_code, status.HTTP_400_BAD_REQUEST)
        # A backup code goes to its own device: the authenticator's failures don't block it.
        self.assertEqual(self.login(otp_code=codes[0]).status_code, status.HTTP_204_NO_CONTENT)

    def test_setup_and_confirm_from_the_admin(self):
        self.client.force_login(self.user)
        setup = self.client.post(reverse('2fa-setup')).json()
        self.assertTrue(setup['otpauth_url'].startswith('otpauth://totp/'))
        self.assertTrue(setup['qr_svg'].startswith('<svg'))

        device = TOTPDevice.objects.get(user=self.user)
        self.assertFalse(device.confirmed)
        wrong = self.client.post(reverse('2fa-confirm'), {'otp_code': '000000'}, format='json')
        self.assertEqual(wrong.status_code, status.HTTP_400_BAD_REQUEST)

        response = self.client.post(reverse('2fa-confirm'), {'otp_code': current_code(device)}, format='json')
        self.assertEqual(len(response.json()['backup_codes']), otp.BACKUP_CODES)
        self.assertTrue(self.me()['otp_verified'])
        # Once on, it's turned off before setting it up again.
        self.assertEqual(self.client.post(reverse('2fa-setup')).status_code, status.HTTP_400_BAD_REQUEST)

    def test_disable_needs_the_password_and_a_code(self):
        _, codes = self.enable()
        self.client.force_login(self.user)
        url = reverse('2fa-disable')
        self.assertEqual(
            self.client.post(url, {'password': 'otra', 'otp_code': codes[0]}, format='json').status_code,
            status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            self.client.post(url, {'password': self.password, 'otp_code': '000000'}, format='json').status_code,
            status.HTTP_400_BAD_REQUEST)
        response = self.client.post(url, {'password': self.password, 'otp_code': codes[0]}, format='json')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(otp.enabled(self.user))

    @override_settings(REQUIRE_2FA=True)
    def test_where_required_staff_without_the_second_factor_gets_nothing(self):
        self.client.force_login(self.user)
        response = self.client.get(reverse('order-list'))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.json()['detail'], 'Two-factor authentication required.')
        self.assertEqual(self.client.get(reverse('conversation-list')).status_code, status.HTTP_403_FORBIDDEN)
        # What it needs to set it up still answers.
        self.assertTrue(self.me()['otp_required'])
        self.assertEqual(self.client.post(reverse('2fa-setup')).status_code, status.HTTP_200_OK)

        device = TOTPDevice.objects.get(user=self.user)
        self.client.post(reverse('2fa-confirm'), {'otp_code': current_code(device)}, format='json')
        self.assertEqual(self.client.get(reverse('order-list')).status_code, status.HTTP_200_OK)


class AuditTests(APITestCase):
    def test_changes_through_the_api_record_who_made_them(self):
        user = make_staff()
        self.client.force_login(user)
        response = self.client.post(reverse('customer-list'), {'name': 'Ana Gómez'}, format='json')
        customer = Customer.objects.get(pk=response.json()['id'])
        self.client.patch(reverse('customer-detail', args=[customer.pk]), {'name': 'Ana María Gómez'}, format='json')

        entries = LogEntry.objects.get_for_object(customer).order_by('timestamp')
        self.assertEqual([entry.action for entry in entries], [LogEntry.Action.CREATE, LogEntry.Action.UPDATE])
        self.assertEqual({entry.actor for entry in entries}, {user})
        self.assertEqual(entries.last().changes_dict['name'], ['Ana Gómez', 'Ana María Gómez'])

    def test_role_changes_are_recorded(self):
        user = make_staff(role=READ_ONLY)
        user.groups.add(Group.objects.get(name=ADMINISTRATION))
        self.assertTrue(LogEntry.objects.get_for_object(user).filter(changes__has_key='groups').exists())

    def test_logins_and_failures_go_to_the_audit_log(self):
        user = make_staff()
        user.set_password('una clave bien larga')
        user.save()
        login = reverse('rest_login')
        with self.assertLogs('audit', 'INFO') as logs:
            self.client.post(login, {'username': 'admin', 'password': 'otra'}, format='json')
            self.client.post(login, {'username': 'admin', 'password': 'una clave bien larga'}, format='json')
        self.assertIn('login failed: admin', logs.output[0])
        self.assertIn('login: admin from 127.0.0.1', logs.output[1])
        # Never the password.
        self.assertNotIn('una clave', ' '.join(logs.output))
