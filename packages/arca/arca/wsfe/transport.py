import httpx

from ..soap import WSFE_ENV
from .operations import Operation


class WSFETransport:
    base_url = "https://wswhomo.afip.gov.ar/wsfev1/service.asmx"

    def _url(self, operation: Operation):
        return f"{self.base_url}?op={operation}"

    def send(self, operation: Operation, content: str):
        url = self._url(operation)
        headers = {
            "Content-Type": (
                "application/soap+xml; "
                f'charset=utf-8; action="{WSFE_ENV}{operation}"'
            ),
        }

        response = httpx.post(
            url,
            content=content,
            headers=headers,
            verify=False,
            timeout=None,
        )

        response.raise_for_status()

        return response.text
