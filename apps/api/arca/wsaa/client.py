import xml.etree.ElementTree as ET
import httpx

from .ticket import create_login_ticket_request, parse_ticket
from .cms import create_cms

WSAA_URL = "https://wsaahomo.afip.gov.ar/ws/services/LoginCms"

SOAP_ENV = "http://www.w3.org/2003/05/soap-envelope"
WSAA_ENV = "http://wsaa.view.sua.dvadac.desein.afip.gov" 

ET.register_namespace("soapenv", SOAP_ENV)
ET.register_namespace("wsaa", WSAA_ENV)


class WSAAClient:
    def __init__(self):
        self.url = WSAA_URL

    def _create_login_cms_request(self, cms: str):
        envelope = ET.Element(f"{{{SOAP_ENV}}}Envelope")
        body = ET.SubElement(envelope, f"{{{SOAP_ENV}}}Body")

        loginCms = ET.SubElement(body, f"{{{WSAA_ENV}}}loginCms")
        ET.SubElement(loginCms, f"{{{WSAA_ENV}}}In0").text = cms

        return ET.tostring(envelope, encoding="UTF-8", xml_declaration=True)

    def _login_cms(self, cms: str):
        xml = self._create_login_cms_request(cms)

        response = httpx.post(
            self.url, 
            content=xml, 
            headers={
                "Content-Type": "application/soap+xml",
                "SOAPAction": "urn:LoginCms"
            },
            verify=False,
            timeout=None
        )

        response.raise_for_status()

        return response.text

    def get_ticket(self, service: str):
        tra = create_login_ticket_request(service)

        cms = create_cms(tra)

        response = self._login_cms(cms)

        return parse_ticket(response)

