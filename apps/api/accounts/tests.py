import io
import time
from unittest import mock

from allauth.mfa.models import Authenticator
from allauth.mfa.recovery_codes.internal.auth import RecoveryCodes
from allauth.mfa.totp.internal.auth import TOTP, format_hotp_value, generate_totp_secret, hotp_value
from auditlog.models import LogEntry
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.core.cache import cache
from django.core.management import CommandError, call_command
from django.test import TestCase, override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase, APITransactionTestCase

from config.testing import make_staff
from orders.models import Customer

from .roles import ADMINISTRATION, INVOICING, READ_ONLY, sync_roles

User = get_user_model()

# allauth headless, browser client (docs/architecture/auth.md).
ALLAUTH = '/_allauth/browser/v1'
PASSWORD = 'una clave bien larga'


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

        data = self.client.get(reverse('user-details')).json()
        self.assertTrue(data['is_staff'])
        self.assertIn('billing.add_invoice', data['permissions'])
        self.assertNotIn('orders.add_customer', data['permissions'])

        self.client.patch(reverse('user-details'), {'is_staff': False, 'permissions': []}, format='json')
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


def code_for(secret: str) -> str:
    """The authenticator app's code right now."""
    return format_hotp_value(hotp_value(secret, int(time.time()) // 30))


class AllauthMixin:
    """Logs in through allauth, as the admin does, with `self.user` (password PASSWORD)."""

    def setUp(self):
        # allauth keeps used TOTP codes and its rate limits in the cache.
        cache.clear()
        self.user = make_staff()
        self.user.set_password(PASSWORD)
        self.user.save()

    def enable_mfa(self):
        """2FA on, as if set up from the admin: (TOTP secret, recovery codes)."""
        secret = generate_totp_secret()
        TOTP.activate(self.user, secret)
        return secret, RecoveryCodes.activate(self.user).get_unused_codes()

    def login(self, username='admin', password=PASSWORD):
        return self.client.post(
            f'{ALLAUTH}/auth/login', {'username': username, 'password': password}, format='json')

    def authenticate(self, code):
        return self.client.post(f'{ALLAUTH}/auth/2fa/authenticate', {'code': code}, format='json')

    def me(self):
        return self.client.get(reverse('user-details'))

    def reauthenticate(self):
        """Turning 2FA on or off asks for the password again, even right after logging in."""
        return self.client.post(f'{ALLAUTH}/auth/reauthenticate', {'password': PASSWORD}, format='json')


class TwoFactorTests(AllauthMixin, APITestCase):
    def test_wrong_credentials_are_refused(self):
        for username, password in (('admin', 'otra'), ('nadie', PASSWORD)):
            response = self.login(username, password)
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
            self.assertEqual(response.json()['errors'][0]['code'], 'username_password_mismatch')

    def test_without_2fa_the_password_is_enough(self):
        self.assertEqual(self.login().status_code, status.HTTP_200_OK)
        me = self.me().json()
        self.assertFalse(me['mfa_enabled'])
        self.assertFalse(me['mfa_verified'])

    def test_with_2fa_the_login_waits_for_the_code(self):
        secret, _ = self.enable_mfa()

        response = self.login()
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        flows = response.json()['data']['flows']
        self.assertIn({'id': 'mfa_authenticate', 'is_pending': True}, [
            {'id': flow['id'], 'is_pending': flow.get('is_pending', False)} for flow in flows])
        self.assertEqual(self.me().status_code, status.HTTP_403_FORBIDDEN)

        self.assertEqual(self.authenticate('000000').status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(self.authenticate(code_for(secret)).status_code, status.HTTP_200_OK)
        me = self.me().json()
        self.assertTrue(me['mfa_enabled'])
        self.assertTrue(me['mfa_verified'])

    def test_a_recovery_code_works_once(self):
        _, codes = self.enable_mfa()
        self.login()
        with self.assertLogs('audit', 'INFO') as logs:
            self.assertEqual(self.authenticate(codes[0]).status_code, status.HTTP_200_OK)
        self.assertIn('used a recovery code', ' '.join(logs.output))

        self.client.delete(f'{ALLAUTH}/auth/session')
        self.login()
        self.assertEqual(self.authenticate(codes[0]).status_code, status.HTTP_400_BAD_REQUEST)

    def test_logout_ends_the_session(self):
        self.login()
        self.assertEqual(self.client.delete(f'{ALLAUTH}/auth/session').status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(self.me().status_code, status.HTTP_403_FORBIDDEN)

    def test_turning_it_off_after_a_while_asks_for_the_password_again(self):
        secret, _ = self.enable_mfa()
        self.login()
        self.authenticate(code_for(secret))
        totp = f'{ALLAUTH}/account/authenticators/totp'

        with override_settings(ACCOUNT_REAUTHENTICATION_TIMEOUT=0):
            response = self.client.delete(totp)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('reauthenticate', [flow['id'] for flow in response.json()['data']['flows']])

        self.reauthenticate()
        self.assertEqual(self.client.delete(totp).status_code, status.HTTP_200_OK)
        self.assertFalse(Authenticator.objects.filter(user=self.user, type=Authenticator.Type.TOTP).exists())

    def test_signup_is_closed(self):
        response = self.client.post(
            f'{ALLAUTH}/auth/signup', {'username': 'nuevo', 'password': PASSWORD}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(User.objects.filter(username='nuevo').exists())


# allauth announces a new authenticator on commit, and accounts.mfa marks the session as verified
# then. A TestCase never commits: these run with real transactions, as a request does.
class TwoFactorSetupTests(AllauthMixin, APITransactionTestCase):
    def test_setting_it_up_from_the_admin(self):
        self.login()
        totp = f'{ALLAUTH}/account/authenticators/totp'
        # Not set up yet: allauth answers with the secret to scan.
        pending = self.client.get(totp)
        self.assertEqual(pending.status_code, status.HTTP_404_NOT_FOUND)
        meta = pending.json()['meta']
        self.assertTrue(meta['totp_url'].startswith('otpauth://totp/'))

        unconfirmed = self.client.post(totp, {'code': code_for(meta['secret'])}, format='json')
        self.assertEqual(unconfirmed.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('reauthenticate', [flow['id'] for flow in unconfirmed.json()['data']['flows']])
        self.assertEqual(self.reauthenticate().status_code, status.HTTP_200_OK)

        self.assertEqual(self.client.post(totp, {'code': '000000'}, format='json').status_code,
                         status.HTTP_400_BAD_REQUEST)
        with self.assertLogs('audit', 'INFO'):
            response = self.client.post(totp, {'code': code_for(meta['secret'])}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        codes = self.client.get(f'{ALLAUTH}/account/authenticators/recovery-codes').json()
        self.assertEqual(len(codes['data']['unused_codes']), codes['data']['total_code_count'])
        # Turning it on took a code: the session counts as verified.
        self.assertTrue(self.me().json()['mfa_verified'])

    @override_settings(REQUIRE_2FA=True)
    def test_where_required_staff_without_the_second_factor_gets_nothing(self):
        self.login()
        response = self.client.get(reverse('order-list'))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.json()['detail'], 'Two-factor authentication required.')
        self.assertEqual(self.client.get(reverse('conversation-list')).status_code, status.HTTP_403_FORBIDDEN)
        # What it needs to set it up still answers.
        self.assertTrue(self.me().json()['mfa_required'])

        totp = f'{ALLAUTH}/account/authenticators/totp'
        secret = self.client.get(totp).json()['meta']['secret']
        self.reauthenticate()
        self.client.post(totp, {'code': code_for(secret)}, format='json')
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
        user.set_password(PASSWORD)
        user.save()
        login = f'{ALLAUTH}/auth/login'
        with self.assertLogs('audit', 'INFO') as logs:
            self.client.post(login, {'username': 'admin', 'password': 'otra'}, format='json')
            self.client.post(login, {'username': 'admin', 'password': PASSWORD}, format='json')
        self.assertIn('login failed: admin', logs.output[0])
        self.assertIn('login: admin from 127.0.0.1', logs.output[1])
        # Never the password.
        self.assertNotIn('una clave', ' '.join(logs.output))


class PasskeyTests(AllauthMixin, APITestCase):
    """allauth runs the WebAuthn ceremony; what's ours is the domain a passkey belongs to."""

    def creation_options(self, **headers):
        self.login()
        self.reauthenticate()
        response = self.client.get(f'{ALLAUTH}/account/authenticators/webauthn', headers=headers)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        return response.json()['data']['creation_options']['publicKey']

    @override_settings(FRONTEND_ORIGINS=['https://admin.example.com'], ALLOWED_HOSTS=['testserver', 'api.internal'])
    def test_a_passkey_belongs_to_the_frontend_domain_not_the_api_host(self):
        rp = self.creation_options(**{'Host': 'api.internal', 'X-Forwarded-Host': 'admin.example.com'})['rp']
        self.assertEqual(rp, {'id': 'admin.example.com', 'name': 'ecomm admin'})

    @override_settings(FRONTEND_ORIGINS=['https://admin.example.com'], ALLOWED_HOSTS=['testserver', 'api.internal'])
    def test_a_forwarded_host_outside_the_frontends_is_ignored(self):
        rp = self.creation_options(**{'Host': 'api.internal', 'X-Forwarded-Host': 'sitio-malo.example'})['rp']
        self.assertEqual(rp['id'], 'api.internal')

    def test_adding_one_needs_the_password_again(self):
        self.login()
        response = self.client.get(f'{ALLAUTH}/account/authenticators/webauthn')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class CsrfTests(APITestCase):
    """The test client skips CSRF by default: this one checks it, as a browser would face it."""

    def setUp(self):
        self.client = APIClient(enforce_csrf_checks=True)
        self.client.force_login(make_staff())

    def create_customer(self, **headers):
        return self.client.post(reverse('customer-list'), {'name': 'Ana Gómez'}, format='json', headers=headers)

    def test_a_write_with_the_session_but_no_token_is_refused(self):
        response = self.create_customer()
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('CSRF', response.json()['detail'])

    def test_the_session_endpoint_sets_the_token_the_writes_need(self):
        self.client.get(reverse('user-details'))
        token = self.client.cookies['csrftoken'].value
        self.assertEqual(self.create_customer(**{'X-CSRFToken': token}).status_code, status.HTTP_201_CREATED)

    def test_another_origin_is_refused_even_with_the_token(self):
        self.client.get(reverse('user-details'))
        token = self.client.cookies['csrftoken'].value
        response = self.create_customer(**{'X-CSRFToken': token, 'Origin': 'https://sitio-malo.example'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_reads_need_no_token(self):
        self.assertEqual(self.client.get(reverse('customer-list')).status_code, status.HTTP_200_OK)

    def test_the_login_needs_the_token_too(self):
        # Without it another site could log the browser into an account of theirs ("login CSRF").
        client = APIClient(enforce_csrf_checks=True)
        user = make_staff('otro')
        user.set_password(PASSWORD)
        user.save()
        login = f'{ALLAUTH}/auth/login'
        body = {'username': 'otro', 'password': PASSWORD}

        self.assertEqual(client.post(login, body, format='json').status_code, status.HTTP_403_FORBIDDEN)

        # The admin reads the session first (403 without one), which sets the token.
        self.assertEqual(client.get(reverse('user-details')).status_code, status.HTTP_403_FORBIDDEN)
        token = client.cookies['csrftoken'].value
        response = client.post(login, body, format='json', headers={'X-CSRFToken': token})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
