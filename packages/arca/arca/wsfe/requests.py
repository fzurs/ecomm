import xml.etree.ElementTree as ET
from datetime import datetime, timezone

from ..namespaces import SOAP_ENV, WSFE_ENV
from ..soap import soap_tag, wsfe_tag

from ..wsaa.types import AccessTicket

from .operations import Operation
from .types import CreateVoucherRequest, CAEA

ET.register_namespace("soap", SOAP_ENV)
ET.register_namespace("wsfe", WSFE_ENV)


def _create_authenticated_operation_request(
    operation: Operation, cuit: str, access_ticket: AccessTicket
):
    envelope = ET.Element(soap_tag("Envelope"))

    body = ET.SubElement(envelope, soap_tag("Body"))

    param = ET.SubElement(body, wsfe_tag(operation))

    auth = ET.SubElement(param, wsfe_tag("Auth"))
    ET.SubElement(auth, wsfe_tag("Token")).text = access_ticket.token
    ET.SubElement(auth, wsfe_tag("Sign")).text = access_ticket.sign
    ET.SubElement(auth, wsfe_tag("Cuit")).text = cuit

    return envelope, param


def create_operation_request(
    operation: Operation, cuit: str, access_ticket: AccessTicket
):
    envelope, _ = _create_authenticated_operation_request(
        operation, cuit, access_ticket
    )

    return ET.tostring(envelope, encoding="utf-8", xml_declaration=True)


def create_get_last_voucher_request(
    pto_vta: int, cbte_tipo: int, cuit: str, access_ticket: AccessTicket
):
    envelope, param = _create_authenticated_operation_request(
        Operation.GET_LAST_VOUCHER, cuit=cuit, access_ticket=access_ticket
    )

    ET.SubElement(param, wsfe_tag("PtoVta")).text = str(pto_vta)
    ET.SubElement(param, wsfe_tag("CbteTipo")).text = str(cbte_tipo)

    return ET.tostring(envelope, encoding="utf-8", xml_declaration=True)


def build_create_voucher_request(
    request: CreateVoucherRequest,
    caea: CAEA,
    cuit: str,
    access_ticket: AccessTicket,
):
    envelope, param = _create_authenticated_operation_request(
        Operation.CREATE_VOUCHER, cuit, access_ticket
    )

    ET.SubElement(param, wsfe_tag("Periodo")).text = caea.period.strftime("%Y%m")
    ET.SubElement(param, wsfe_tag("Orden")).text = str(caea.order)

    fecae_req = ET.SubElement(param, wsfe_tag("FeCAEReq"))

    fecab_req = ET.SubElement(fecae_req, wsfe_tag("FeCabReq"))

    fecab_req_data = {
        "CantReg": request.cant_reg,
        "CbteTipo": str(request.cbte_tipo),
        "PtoVta": str(request.pto_vta),
    }
    for tag, value in fecab_req_data.items():
        ET.SubElement(fecab_req, wsfe_tag(tag)).text = value

    fedet_req = ET.SubElement(fecae_req, wsfe_tag("FeDetReq"))
    fecae_det_request = ET.SubElement(fedet_req, wsfe_tag("FECAEDetRequest"))

    fecae_det_request_data = {
        "Concepto": request.concepto,
        "DocTipo": request.doc_tipo,
        "CbteDesde": str(request.cbte_desde),
        "CbteHasta": str(request.cbte_hasta),
        "CbteFch": (
            (
                request.cbte_fch
                if request.cbte_fch is not None
                else datetime.now(timezone.utc)
            ).strftime("%Y%m%d")
        ),
        "ImpTotal": format(request.imp_total, ".2f"),
        "ImpTotConc": format(request.imp_tot_conc, ".2f"),
        "ImpNeto": format(request.imp_neto, ".2f"),
        "ImpOpEx": format(request.imp_op_ex, ".2f"),
        "ImpIVA": format(request.imp_iva, ".2f"),
        "ImpTrib": format(request.imp_trib, ".2f"),
        "MonId": request.mon_id,
        "CondicionIVAReceptorId": request.condicion_iva_receptor_id,
    }
    for tag, value in fecae_det_request_data.items():
        ET.SubElement(fecae_det_request, wsfe_tag(tag)).text = value

    return ET.tostring(envelope, encoding="utf-8", xml_declaration=True)
