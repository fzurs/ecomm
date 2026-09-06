import xml.etree.ElementTree as ET

from ..namespaces import WSFE_ENV
from ..soap import wsfe_tag

from .types import CurrencyType, VatReceptorCondition, WSFEMessage

ET.register_namespace("wsfe", WSFE_ENV)


def parse_currency_types_response(response: str) -> list[CurrencyType]:
    root = ET.fromstring(response)

    currencies = root.findall(f".//{wsfe_tag('Moneda')}")

    return [
        CurrencyType(
            id=value.findtext(wsfe_tag("Id")),
            description=value.findtext(wsfe_tag("Desc")),
        )
        for value in currencies
    ]


def parse_vat_receptor_condition_response(response: str) -> list[VatReceptorCondition]:
    root = ET.fromstring(response)

    conditions = root.findall(f".//{wsfe_tag('CondicionIvaReceptor')}")

    return [
        VatReceptorCondition(
            id=value.findtext(wsfe_tag("Id")),
            description=value.findtext(wsfe_tag("Desc")),
            voucher_class=value.findtext(wsfe_tag("Cmp_Clase")),
        )
        for value in conditions
    ]


def parse_errors(response: str) -> list[WSFEMessage]:
    root = ET.fromstring(response)

    errors = root.find(f".//{wsfe_tag("Errors")}")
    if errors is None:
        return []

    return [
        WSFEMessage(
            code=int(error.findtext(wsfe_tag("Code"))),
            message=error.findtext(wsfe_tag("Msg")),
        )
        for error in errors.findall(wsfe_tag("Err"))
    ]


def parse_get_last_voucher_response(response: str) -> int:
    root = ET.fromstring(response)

    result = root.find(f".//{wsfe_tag('FECompUltimoAutorizadoResult')}")

    return int(result.findtext(wsfe_tag("CbteNro")))
