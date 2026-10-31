from unittest import mock

from django.db import connection
from django.test import TestCase
from django.urls import reverse


class HealthTests(TestCase):
    def test_it_answers_without_a_session(self):
        response = self.client.get(reverse('health'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {'status': 'ok'})

    def test_a_database_down_is_a_503(self):
        with mock.patch.object(connection, 'cursor', side_effect=Exception('down')), \
                self.assertLogs('config.views', 'ERROR'):
            response = self.client.get(reverse('health'))
        self.assertEqual(response.status_code, 503)
