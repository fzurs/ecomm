import httpx


class WSAATransport:
    url = "https://wsaahomo.afip.gov.ar/ws/services/LoginCms"

    def send(self, xml: str) -> str:
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
        response.raise_for_status()
        return response.text
