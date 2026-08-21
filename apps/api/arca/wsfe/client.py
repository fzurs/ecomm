from builtins import format

from ...billing.models import Invoice
from ..wsaa.types import AccessTicket
import xml.etree.ElementTree as ET
import httpx
from .types import CurrencyType

BASE_URL = "https://wswhomo.afip.gov.ar/wsfev1/service.asmx"

OP_AUTHORIZE = "FEParamGetTiposMonedas"
OP_GET_CURRENCY_TYPES = "FEParamGetTiposMonedas"

SOAP_ENV = "http://www.w3.org/2003/05/soap-envelope"
AR_ENV = "http://ar.gov.afip.dif.FEV1/"
WSFE_ENV = AR_ENV

ET.register_namespace("soapenv", SOAP_ENV)
ET.register_namespace("ar", AR_ENV)


class WSFEClient:
    def __init__(self, cuit: str):
        self.cuit = cuit

    def _url(self, operation: str):
        return f"{BASE_URL}?op={operation}"

    def _create_currency_types_request(self, ticket: AccessTicket):
        envelope = ET.Element(f"{{{SOAP_ENV}}}Envelope")
        body = ET.SubElement(envelope, f"{{{SOAP_ENV}}}Body")
        param = ET.SubElement(body, f"{{{WSFE_ENV}}}FEParamGetTiposMonedas")

        auth = ET.SubElement(param, "Auth")
        ET.SubElement(auth, "Token").text = ticket.token
        ET.SubElement(auth, "Sign").text = ticket.sign
        ET.SubElement(auth, "Cuit").text = self.cuit

        return ET.tostring(envelope, encoding="UTF-8")

    def _parse_currency_types(self, response: str) -> list[CurrencyType]:
        root = ET.fromstring(response)

        currency_types = []
        for currency in root.findall(f".//{{{WSFE_ENV}}}Moneda"):
            currency_types.append(
                CurrencyType(
                    id=currency.findtext(f"{{{WSFE_ENV}}}Id"), 
                    description=currency.findtext(f"{{{WSFE_ENV}}}Desc")
                )
            )
        return currency_types

    def get_currency_types(self, ticket: AccessTicket):
        url = self._url(OP_GET_CURRENCY_TYPES)

        xml = self._create_currency_types_request(ticket) 

        response = httpx.post(
            url, 
            content=xml, 
            headers={"Content-Type": "application/soap+xml; charset=utf-8"},
            verify=False, 
            timeout=None
        )

        return self._parse_currency_types(response) 


    def _create_authorize_request(self, invoice: Invoice, ticket: AccessTicket):

        envelope = ET.Element(f"{{{SOAP_ENV}}}Envelope")
        body = ET.SubElement(envelope, f"{{{SOAP_ENV}}}Body")
        fecae = ET.SubElement(body, f"{{{AR_ENV}}}FECAESolicitar")

        auth = ET.SubElement(fecae, f"{{{AR_ENV}}}Auth")
        ET.SubElement(auth, f"{{{AR_ENV}}}Token").text = ticket.token
        ET.SubElement(auth, f"{{{AR_ENV}}}Sign").text = ticket.sign
        ET.SubElement(auth, f"{{{AR_ENV}}}Cuit").text = self.cuit

        fecae_req = ET.SubElement(fecae, f"{{{AR_ENV}}}FeCAEReq")

        fecab = ET.SubElement(fecae_req, f"{{{AR_ENV}}}FeCabReq")
        ET.SubElement(fecab, f"{{{AR_ENV}}}CantReg").text = "1"
        ET.SubElement(fecab, f"{{{AR_ENV}}}CbteTipo").text = str(invoice.invoice_type)
        ET.SubElement(fecab, f"{{{AR_ENV}}}PtoVta").text = str(invoice.point_of_sale)

        fedet = ET.SubElement(fecae_req, f"{{{AR_ENV}}}FeDetReq")
        ET.SubElement(fedet, f"{{{AR_ENV}}}Concepto").text = "1"
        ET.SubElement(fedet, f"{{{AR_ENV}}}DocTipo").text = str(invoice.order.customer.document_type)
        ET.SubElement(fedet, f"{{{AR_ENV}}}DocNro").text = invoice.order.customer.document_number
        ET.SubElement(fedet, f"{{{AR_ENV}}}CbteDesde").text = str(invoice.invoice_number)
        ET.SubElement(fedet, f"{{{AR_ENV}}}CbteHasta").text = str(invoice.invoice_number)
        ET.SubElement(fedet, f"{{{AR_ENV}}}ImpTotal").text = format(invoice.total_amount, ".2f")
        ET.SubElement(fedet, f"{{{AR_ENV}}}ImpTotConc").text = "0"
        ET.SubElement(fedet, f"{{{AR_ENV}}}ImpNeto").text = format(invoice.net_amount, ".2f")
        ET.SubElement(fedet, f"{{{AR_ENV}}}ImpOpEx").text = "0"
        ET.SubElement(fedet, f"{{{AR_ENV}}}ImpIVA").text = format(invoice.vat_amount, ".2f")
        ET.SubElement(fedet, f"{{{AR_ENV}}}ImpTrib").text = "0"
        ET.SubElement(fedet, f"{{{AR_ENV}}}MonId").text = "PES"

        return ET.tostring(envelope, encoding="UTF-8", xml_declaration=True)

    def authorize(self, invoice: Invoice, ticket: AccessTicket):
        url = self._url(OP_AUTHORIZE)

        xml = self._create_authorize_request(invoice, ticket)

        response = httpx.post(
            url, 
            content=xml, 
            headers={"Content-Type": "application/soap+xml; charset=utf-8"},
            verify=False,
            timeout=None
        )

        print("In development")
        print("Status:", response.status_code, "\n")
        print("Response text:", response.text)
