import xml.etree.ElementTree as ET
from datetime import datetime

from ..namespaces import SOAP_ENV, WSAA_ENV
from ..soap import soap_tag, wsaa_tag

ET.register_namespace("soap", SOAP_ENV)
ET.register_namespace("wsaa", WSAA_ENV)


def create_login_ticket_request(
    service: str, unique_id: str, generation_time: datetime, expiration_time: datetime
):
    generation_time_str = generation_time.strftime("%Y-%m-%dT%H:%M:%SZ")
    expiration_time_str = expiration_time.strftime("%Y-%m-%dT%H:%M:%SZ")

    root = ET.Element("loginTicketRequest", version="1.0")

    header = ET.SubElement(root, "header")

    ET.SubElement(header, "uniqueId").text = unique_id
    ET.SubElement(header, "generationTime").text = generation_time_str
    ET.SubElement(header, "expirationTime").text = expiration_time_str

    ET.SubElement(root, "service").text = service

    return ET.tostring(root, encoding="utf-8", xml_declaration=True)


def create_login_request(cms: str):
    envelope = ET.Element(soap_tag("Envelope"))

    body = ET.SubElement(envelope, soap_tag("Body"))

    login_cms = ET.SubElement(body, wsaa_tag("loginCms"))

    ET.SubElement(login_cms, wsaa_tag("In0")).text = cms

    return ET.tostring(envelope, encoding="utf-8", xml_declaration=True)
