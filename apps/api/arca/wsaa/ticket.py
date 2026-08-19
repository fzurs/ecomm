from datetime import datetime, timezone, timedelta
import xml.etree.ElementTree as ET
from .types import AccessTicket

def create_login_ticket_request(service: str):
    now = datetime.now(timezone.utc).replace(microsecond=0)

    root = ET.Element("loginTicketRequest", version="1.0")

    header = ET.SubElement(root, "header")
    ET.SubElement(header, "uniqueId").text = str(int(now.timestamp()))
    ET.SubElement(header, "generationTime").text = (now - timedelta(minutes=1)).strftime("%Y-%m-%dT%H:%M:%SZ")
    ET.SubElement(header, "expirationTime").text = (now + timedelta(minutes=10)).strftime("%Y-%m-%dT%H:%M:%SZ")

    ET.SubElement(root, "service").text = service

    return ET.tostring(root, encoding="UTF-8", xml_declaration=True)

def parse_ticket(response: str):
    root = ET.fromstring(response)

    login_return = root.find(".//{*}loginCmsReturn")

    if login_return is None or not login_return.text:
        raise ValueError("loginCmsReturn not found")

    ticket = ET.fromstring(login_return.text)

    token = ticket.findtext(".//token")
    sign = ticket.findtext(".//sign")
    expiration_time = ticket.findtext(".//expirationTime")

    if not token or not sign: raise ValueError("Invalid access ticket")

    return AccessTicket(token=token, sign=sign, expiration_time=expiration_time)