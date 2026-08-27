from django.test import SimpleTestCase
from django.conf import settings
from arca.wsaa.types import AccessTicket
from datetime import datetime
from arca.wsaa.client import WSAAClient
from arca.client import ARCAClient


class ARCAClientTests(SimpleTestCase):
    def setUp(self):
        expiration_time = datetime.fromisoformat(
            settings.ARCA_ACCESS_TICKET_EXPIRATION_TIME
        )
        access_ticket = AccessTicket(
            token=settings.ARCA_ACCESS_TICKET_TOKEN,
            sign=settings.ARCA_ACCESS_TICKET_SIGN,
            expiration_time=expiration_time,
        )
        self.arca_client = ARCAClient()
        self.arca_client.wsaa.access_ticket = access_ticket

    def test_get_currency_types(self):
        currencies = self.arca_client.electronic_billing.get_currency_types()

        self.assertIsInstance(currencies, list)
        self.assertGreater(len(currencies), 0)
