from .types import AccessTicket

import xml.etree.ElementTree as ET


def parse_access_ticket_response(success_response: str) -> AccessTicket:
    root = ET.fromstring(success_response)

    login_cms_return = root.find(".//{*}loginCmsReturn")

    access_ticket = ET.fromstring(login_cms_return.text)

    token = access_ticket.findtext(".//token")
    sign = access_ticket.findtext(".//sign")
    expiration_time = access_ticket.findtext(".//expirationTime")

    return AccessTicket(token=token, sign=sign, expiration_time=expiration_time)
