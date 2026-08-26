import httpx

from .operations import Operation


class WSFETransport:
    base_url = "https://wswhomo.afip.gov.ar/wsfev1/service.asmx"

    def _url(self, operation: Operation):
        return f"{self.base_url}?op={operation}"

    def send(self, operation: Operation, content: str):
        url = self._url(operation)

        return httpx.post(
            url,
            content,
            headers={"Content-Type": "application/soap+xml; charset=utf-8"},
            verify=False,
            timeout=None,
        )
