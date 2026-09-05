from datetime import datetime, timezone, timedelta

from .credentials import load_certificate, load_private_key
from .requests import create_login_ticket_request, create_login_request
from .signing import sign_login_ticket_request
from .responses import parse_access_ticket_response
from .cache import AccessTicketCache
from .types import ARCACredentials
from .transport import WSAATransport


class WSAAClient:
    def __init__(self, credentials: ARCACredentials, cache: AccessTicketCache):
        self.certificate = load_certificate(credentials.certificate_path)
        self.private_key = load_private_key(credentials.private_key_path)
        self.cache = cache
        self._transport = WSAATransport()

    def _build_login_ticket_request(self, service: str):
        now = datetime.now(timezone.utc).replace(microsecond=0)

        return create_login_ticket_request(
            service,
            unique_id=str(int(now.timestamp())),
            generation_time=now - timedelta(minutes=1),
            expiration_time=now + timedelta(minutes=10),
        )

    def _request_access_ticket(self, service: str):
        tra = self._build_login_ticket_request(service)
        cms = sign_login_ticket_request(tra, self.certificate, self.private_key)
        xml = create_login_request(cms)
        response = self._transport.send(xml)
        return parse_access_ticket_response(response)

    def get_access_ticket(self, service: str):
        access_ticket = self.cache.get(service)

        if access_ticket is not None and not access_ticket.is_expired:
            return access_ticket

        access_ticket = self._request_access_ticket(service)

        self.cache.set(service, access_ticket)

        return access_ticket
