import httpx
from pathlib import Path
from datetime import datetime, timezone, timedelta

from .credentials import load_certificate, load_private_key
from .requests import create_login_ticket_request, create_login_request
from .signing import sign_login_ticket_request
from .responses import parse_access_ticket_response


class WSAAClient:
    url = "https://wsaahomo.afip.gov.ar/ws/services/LoginCms"

    def __init__(self, certificate_path: Path, private_key_path: Path):
        self.certificate = load_certificate(certificate_path)
        self.private_key = load_private_key(private_key_path)

    def _build_login_ticket_request(self, service: str):
        now = datetime.now(timezone.utc).replace(microsecond=0)

        return create_login_ticket_request(
            service,
            unique_id=str(int(now.timestamp())),
            generation_time=now - timedelta(minutes=1),
            expiration_time=now + timedelta(minutes=10),
        )

    def _send_login_request(self, xml: str) -> str:
        response = httpx.post(
            self.url,
            content=xml,
            headers={
                "Content-Type": "application/soap+xml",
                "SOAPAction": "urn:LoginCms",
            },
            verify=False,
            timeout=None,
        )

        print(response.status_code, response.text)

        response.raise_for_status()

        return response.text

    def get_access_ticket(self, service: str):
        tra = self._build_login_ticket_request(service)

        cms = sign_login_ticket_request(tra, self.certificate, self.private_key)

        xml = create_login_request(cms)

        response = self._send_login_request(xml)

        return parse_access_ticket_response(response)
