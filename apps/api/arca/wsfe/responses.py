import xml.etree.ElementTree as ET

from ..namespaces import WSFE_ENV
from ..soap import wsfe_tag

from .types import CurrencyType, VatReceptorCondition

ET.register_namespace("wsfe", WSFE_ENV)


def parse_currency_types_response(response: str) -> list[CurrencyType]:
    root = ET.fromstring(response)

    currencies = root.findall(f".//{wsfe_tag("Moneda")}")

    return [
        CurrencyType(
            id=value.findtext(wsfe_tag("Id")),
            description=value.findtext(wsfe_tag("Des")),
        )
        for value in currencies
    ]


def parse_vat_receptor_condition_response(response: str) -> list[VatReceptorCondition]:
    root = ET.fromstring(response)

    currencies = root.findall(f".//{wsfe_tag("ConditionIvaReceptor")}")

    return [
        VatReceptorCondition(
            id=value.findtext(wsfe_tag("Id")),
            description=value.findtext(wsfe_tag("Desc")),
            voucher_class=value.findtext(wsfe_tag("Cmp_Clase")),
        )
        for value in currencies
    ]
