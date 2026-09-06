import xml.etree.ElementTree as ET

from arca.wsfe.responses import parse_errors
from arca.wsfe.types import WSFEMessage
from arca.namespaces import WSFE_ENV
from arca.soap import wsfe_tag, soap_tag

ET.register_namespace("wsfe", WSFE_ENV)


def test_parse_errors():
    envelope = ET.Element(soap_tag("Envelope"))

    body = ET.SubElement(envelope, soap_tag("Body"))

    errors = ET.SubElement(body, wsfe_tag("Errors"))

    error = ET.SubElement(errors, wsfe_tag("Err"))
    ET.SubElement(error, wsfe_tag("Code")).text = "100"
    ET.SubElement(error, wsfe_tag("Msg")).text = "Test error"

    response = ET.tostring(envelope, encoding="utf-8", xml_declaration=True)

    parsed_errors = parse_errors(response)

    assert parsed_errors == [WSFEMessage(code=100, message="Test error")]
