import xml.etree.ElementTree as ET
from datetime import datetime, timezone, date
from decimal import Decimal

from ..namespaces import SOAP_ENV, WSFE_ENV
from ..soap import soap_tag, wsfe_tag

from ..wsaa.types import AccessTicket

from .operations import Operation as OP
from .types import CreateVoucherRequest, CAEA, Voucher, VoucherBatch

ET.register_namespace("soap", SOAP_ENV)
ET.register_namespace("wsfe", WSFE_ENV)


def _format_value(value) -> str:
    if isinstance(value, Decimal):
        return format(value, ".2f")

    if isinstance(value, date):
        return value.strftime("%Y%m%d")

    return str(value)


def _create_authenticated_operation(
    operation: OP, cuit: str, access_ticket: AccessTicket
):
    envelope = ET.Element(soap_tag("Envelope"))

    body = ET.SubElement(envelope, soap_tag("Body"))

    param = ET.SubElement(body, wsfe_tag(operation))

    auth = ET.SubElement(param, wsfe_tag("Auth"))
    ET.SubElement(auth, wsfe_tag("Token")).text = access_ticket.token
    ET.SubElement(auth, wsfe_tag("Sign")).text = access_ticket.sign
    ET.SubElement(auth, wsfe_tag("Cuit")).text = cuit

    return envelope, param


def create_operation_request(operation: OP, cuit: str, access_ticket: AccessTicket):
    envelope, _ = _create_authenticated_operation(
        operation, cuit=cuit, access_ticket=access_ticket
    )

    return ET.tostring(envelope, encoding="utf-8", xml_declaration=True)


def create_get_last_voucher_request(
    point_of_sale: int, voucher_type: int, cuit: str, access_ticket: AccessTicket
):
    envelope, param = _create_authenticated_operation(
        OP.GET_LAST_VOUCHER, cuit=cuit, access_ticket=access_ticket
    )

    request = {"PtoVta": point_of_sale, "CbteTipo": voucher_type}
    for tag, value in request.items():
        ET.SubElement(param, wsfe_tag(tag)).text = str(value)

    return ET.tostring(envelope, encoding="utf-8", xml_declaration=True)


def _create_voucher_header(fecae_req: ET.Element, header: VoucherBatch):
    fecab_req = ET.SubElement(fecae_req, wsfe_tag("FeCabReq"))

    request = {
        "CantReg": header.quantity,
        "CbteTipo": header.voucher_type,
        "PtoVta": header.point_of_sale,
    }

    for tag, value in request.items():
        ET.SubElement(fecab_req, wsfe_tag(tag)).text = str(value)


def _create_voucher_detail(fedet_req: ET.Element, voucher: Voucher):
    fecae_det_request = ET.SubElement(fedet_req, wsfe_tag("FECAEDetRequest"))

    voucher_date = (
        voucher.voucher_date
        if voucher.voucher_date is not None
        else datetime.now(timezone.utc).date()
    )

    request = {
        "Concepto": voucher.concept,
        "DocTipo": voucher.document_type,
        "CbteDesde": voucher.voucher_from,
        "CbteHasta": voucher.voucher_to,
        "CbteFch": voucher_date,
        "ImpTotal": voucher.total_amount,
        "ImpTotConc": voucher.non_taxable_amount,
        "ImpNeto": voucher.net_amount,
        "ImpOpEx": voucher.tax_amount,
        "ImpIVA": voucher.vat_amount,
        "ImpTrib": voucher.tax_amount,
        "MonId": voucher.currency_code,
        "CondicionIVAReceptorId": voucher.recipient_vat_condition_code,
    }
    for tag, value in request.items():
        ET.SubElement(fecae_det_request, wsfe_tag(tag)).text = _format_value(value)


def build_create_voucher_request(
    request: CreateVoucherRequest,
    caea: CAEA,
    cuit: str,
    access_ticket: AccessTicket,
):
    envelope, param = _create_authenticated_operation(
        OP.CREATE_VOUCHER, cuit=cuit, access_ticket=access_ticket
    )

    ET.SubElement(param, wsfe_tag("Periodo")).text = caea.period.strftime("%Y%m")
    ET.SubElement(param, wsfe_tag("Orden")).text = str(caea.order)

    fecae_req = ET.SubElement(param, wsfe_tag("FeCAEReq"))

    _create_voucher_header(fecae_req, request.header)

    fedet_req = ET.SubElement(fecae_req, wsfe_tag("FeDetReq"))
    for voucher in request.details:
        _create_voucher_detail(fedet_req, voucher)

    return ET.tostring(envelope, encoding="utf-8", xml_declaration=True)
