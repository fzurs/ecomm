import io
import re
import time
from unittest import mock
from urllib.parse import unquote

from allauth.account.models import EmailAddress
from allauth.mfa.models import Authenticator
from allauth.mfa.recovery_codes.internal.auth import RecoveryCodes
from allauth.mfa.totp.internal.auth import TOTP, format_hotp_value, generate_totp_secret, hotp_value
from auditlog.models import LogEntry
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from django.contrib.auth.password_validation import validate_password
from django.core import mail
from django.core.cache import cache
from django.core.exceptions import ValidationError
from django.core.management import CommandError, call_command
from django.test import SimpleTestCase, TestCase, override_settings
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

    def test_the_name_is_all_that_changes(self):
        user = User.objects.create(username='ana', email='ana@example.com')
        self.client.force_login(user)

        response = self.client.patch(
            reverse('user-details'),
            {'first_name': 'Ana', 'last_name': 'Gómez', 'email': 'otra@example.com'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        user.refresh_from_db()
        self.assertEqual((user.first_name, user.last_name, user.email), ('Ana', 'Gómez', 'ana@example.com'))
        self.assertEqual(
            self.client.put(reverse('user-details'), {}, format='json').status_code,
            status.HTTP_405_METHOD_NOT_ALLOWED)


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

    def test_staff_log_in_without_confirming_an_email(self):
        # create_operator makes accounts without one; the store's customers do confirm theirs.
        EmailAddress.objects.create(user=self.user, email='admin@example.com', verified=False)
        self.assertEqual(self.login().status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 0)

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


def link_in(message, path):
    """The key of the store link to `path` in an email from allauth (it comes URL-encoded)."""
    match = re.search(rf'http://localhost:3000{path}/(\S+)', message.body)
    assert match, message.body
    return unquote(match.group(1))


class StoreAccountTests(APITestCase):
    """The store's customers: signup with email, its confirmation and the password reset, with the
    links pointing to the store (HEADLESS_FRONTEND_URLS)."""

    def setUp(self):
        cache.clear()

    def signup(self, email='ana@example.com'):
        return self.client.post(f'{ALLAUTH}/auth/signup', {'email': email, 'password': PASSWORD}, format='json')

    def login(self, email='ana@example.com', password=PASSWORD):
        return self.client.post(f'{ALLAUTH}/auth/login', {'email': email, 'password': password}, format='json')

    def pending_flows(self, response):
        return [flow['id'] for flow in response.json()['data']['flows'] if flow.get('is_pending')]

    def customer(self, verified=True):
        user = User.objects.create(username='ana', email='ana@example.com')
        user.set_password(PASSWORD)
        user.save()
        EmailAddress.objects.create(user=user, email=user.email, verified=verified, primary=True)
        return user

    def test_signup_waits_for_the_email_and_the_link_logs_in(self):
        with self.assertLogs('audit', 'INFO') as logs:
            response = self.signup()
        self.assertIn('signup: ', logs.output[0])
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(self.pending_flows(response), ['verify_email'])
        self.assertEqual(self.client.get(reverse('user-details')).status_code, status.HTTP_403_FORBIDDEN)

        [message] = mail.outbox
        self.assertTrue(message.subject.startswith('[Acme Store] '))
        self.assertIn('Acme Store', message.body)
        self.assertNotIn('testserver', message.body)
        key = link_in(message, '/verify-email')

        verify = f'{ALLAUTH}/auth/email/verify'
        info = self.client.get(verify, headers={'X-Email-Verification-Key': key})
        self.assertEqual(info.json()['data']['email'], 'ana@example.com')
        # Same browser: confirming it completes the login that was waiting.
        self.assertEqual(self.client.post(verify, {'key': key}, format='json').status_code, status.HTTP_200_OK)
        me = self.client.get(reverse('user-details')).json()
        self.assertEqual(me['email'], 'ana@example.com')
        self.assertFalse(me['is_staff'])
        self.assertTrue(me['has_usable_password'])

    def test_an_unconfirmed_customer_cannot_log_in(self):
        self.customer(verified=False)
        response = self.login()
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(self.pending_flows(response), ['verify_email'])
        # allauth sends the link again.
        self.assertEqual(len(mail.outbox), 1)

    def test_a_confirmed_customer_logs_in_with_the_email(self):
        self.customer()
        self.assertEqual(self.login().status_code, status.HTTP_200_OK)

    def test_signing_up_again_with_the_same_email_reveals_nothing(self):
        self.customer()
        response = self.signup()
        # The same answer as a new account: the email tells the owner instead.
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(User.objects.filter(email__iexact='ana@example.com').count(), 1)
        self.assertIn('http://localhost:3000/password/reset', mail.outbox[0].body)

    def test_the_password_reset_link_goes_to_the_store(self):
        self.customer()
        response = self.client.post(f'{ALLAUTH}/auth/password/request', {'email': 'ana@example.com'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        key = link_in(mail.outbox[0], '/password/reset')

        new_password = 'otra clave bien larga'
        response = self.client.post(
            f'{ALLAUTH}/auth/password/reset', {'key': key, 'password': new_password}, format='json')
        # Changed, but not logged in: the store sends the customer to the login.
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(self.login(password=new_password).status_code, status.HTTP_200_OK)

    def test_a_customer_stays_logged_in_for_a_month(self):
        self.customer()
        response = self.login()
        self.assertEqual(response.cookies['sessionid']['max-age'], settings.CUSTOMER_SESSION_AGE)
        session = self.client.session
        self.assertEqual(session.get_expiry_age(), settings.CUSTOMER_SESSION_AGE)
        self.assertFalse(session.get_expire_at_browser_close())

    def test_staff_keep_a_session_that_ends_with_the_browser(self):
        staff = make_staff('otro')
        staff.set_password(PASSWORD)
        staff.save()
        response = self.client.post(f'{ALLAUTH}/auth/login', {'username': 'otro', 'password': PASSWORD}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.cookies['sessionid']['max-age'], '')
        session = self.client.session
        self.assertEqual(session.get_expiry_age(), settings.SESSION_COOKIE_AGE)
        self.assertTrue(session.get_expire_at_browser_close())

    def test_a_customer_password_needs_8_characters(self):
        def signup(password):
            return self.client.post(
                f'{ALLAUTH}/auth/signup', {'email': 'ana@example.com', 'password': password}, format='json')

        for password in ['mar azu', 'password1', '12345678']:
            with self.subTest(password):
                response = signup(password)
                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
                self.assertEqual(response.json()['errors'][0]['param'], 'password')
        self.assertEqual(signup('mar azul').status_code, status.HTTP_401_UNAUTHORIZED)

    @override_settings(STORE_ENABLED=False)
    def test_without_the_store_nobody_signs_up_nor_gets_its_emails(self):
        self.assertEqual(self.signup().status_code, status.HTTP_403_FORBIDDEN)
        self.assertFalse(User.objects.exists())
        # The emails' links would go to a store that isn't there.
        self.customer()
        for email in ['ana@example.com', 'nadie@example.com']:
            response = self.client.post(f'{ALLAUTH}/auth/password/request', {'email': email}, format='json')
            self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(mail.outbox, [])
        # The admin's login is the same.
        staff = make_staff('otro')
        staff.set_password(PASSWORD)
        staff.save()
        response = self.client.post(f'{ALLAUTH}/auth/login', {'username': 'otro', 'password': PASSWORD}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class PasswordLengthTests(SimpleTestCase):
    """accounts.validators.MinimumLengthValidator: 8 characters for customers, 12 for staff."""

    def test_by_kind_of_user(self):
        validate_password('mar azul', User(username='ana', is_staff=False))
        with self.assertRaises(ValidationError):
            validate_password('mar azul', User(username='admin', is_staff=True))
        validate_password('mar azul y sol', User(username='admin', is_staff=True))

    def test_without_a_user_it_takes_the_staff_minimum(self):
        with self.assertRaises(ValidationError):
            validate_password('mar azul')


GOOGLE_CLIENT_ID = 'store.apps.googleusercontent.com'


@override_settings(SOCIALACCOUNT_PROVIDERS={'google': {'APPS': [{'client_id': GOOGLE_CLIENT_ID, 'secret': ''}]}})
class GoogleTests(APITestCase):
    """The store's Google button hands allauth an ID token. Google's signature check is mocked."""

    def setUp(self):
        cache.clear()

    def google_login(self, email='ana@example.com'):
        identity = {
            'iss': 'https://accounts.google.com', 'aud': GOOGLE_CLIENT_ID, 'sub': f'google-{email}',
            'email': email, 'email_verified': True, 'given_name': 'Ana', 'family_name': 'Gómez',
        }
        with mock.patch(
                'allauth.socialaccount.providers.google.views._verify_and_decode', return_value=identity):
            return self.client.post(f'{ALLAUTH}/auth/provider/token', {
                'provider': 'google', 'process': 'login',
                'token': {'client_id': GOOGLE_CLIENT_ID, 'id_token': 'token'},
            }, format='json')

    def me(self):
        return self.client.get(reverse('user-details'))

    def test_the_store_gets_the_client_id_from_the_config(self):
        config = self.client.get(f'{ALLAUTH}/config').json()['data']
        [google] = config['socialaccount']['providers']
        self.assertEqual(google['client_id'], GOOGLE_CLIENT_ID)

    def test_a_new_customer_signs_up_with_the_email_confirmed(self):
        with self.assertLogs('audit', 'INFO') as logs:
            self.assertEqual(self.google_login().status_code, status.HTTP_200_OK)
        self.assertIn('with Google', ' '.join(logs.output))
        me = self.me().json()
        self.assertEqual((me['email'], me['first_name']), ('ana@example.com', 'Ana'))
        self.assertFalse(me['has_usable_password'])
        self.assertTrue(EmailAddress.objects.get(email='ana@example.com').verified)

    def test_an_existing_customer_logs_into_their_account(self):
        user = User.objects.create(username='ana', email='ana@example.com')
        EmailAddress.objects.create(user=user, email=user.email, verified=True, primary=True)
        self.assertEqual(self.google_login().status_code, status.HTTP_200_OK)
        self.assertEqual(self.me().json()['pk'], user.pk)

    def test_never_into_a_staff_account(self):
        staff = make_staff(email='admin@example.com')
        EmailAddress.objects.create(user=staff, email=staff.email, verified=True, primary=True)
        response = self.google_login('admin@example.com')
        self.assertNotEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.me().status_code, status.HTTP_403_FORBIDDEN)

    def test_the_redirect_flow_is_not_mounted(self):
        response = self.client.post(f'{ALLAUTH}/auth/provider/redirect', {
            'provider': 'google', 'process': 'login', 'callback_url': 'http://localhost:3000/'})
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
