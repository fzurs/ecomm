from ..wsaa.client import WSAAClient

from .transport import WSFETransport
from .types import CreateVoucherRequest, CAEA
from .requests import (
    build_create_voucher_request,
    create_operation_request,
    create_get_last_voucher_request,
)
from .operations import Operation as OP
from .responses import (
    parse_currency_types_response,
    parse_vat_receptor_condition_response,
    parse_errors,
    parse_get_last_voucher_response,
)

from .exceptions import WSFEError


class WSFEClient:
    _service = "wsfe"

    def __init__(self, cuit: str, wsaa_client: WSAAClient):
        self.cuit = cuit
        self._wsaa_client = wsaa_client
        self._transport = WSFETransport()

    def _get_access_ticket(self):
        return self._wsaa_client.get_access_ticket(service=self._service)

    def get_last_voucher(self, pto_vta: int, cbte_tipo: int) -> int:
        xml = create_get_last_voucher_request(
            pto_vta=pto_vta,
            cbte_tipo=cbte_tipo,
            cuit=self.cuit,
            access_ticket=self._get_access_ticket(),
        )
        response = self._transport.send(OP.GET_LAST_VOUCHER, xml)
        errors = parse_errors(response)
        if errors:
            raise WSFEError(errors)
        return parse_get_last_voucher_response(response)

    def create_voucher(self, data: CreateVoucherRequest, caea: CAEA):
        access_ticket = self._get_access_ticket()
        xml = build_create_voucher_request(
            request=data, cuit=self.cuit, access_ticket=access_ticket, caea=caea
        )
        response = self._transport.send(OP.CREATE_VOUCHER, xml)
        errors = parse_errors(response)
        if errors:
            raise WSFEError(errors)
        return response

    def get_currency_types(self):
        operation = OP.GET_CURRENCY_TYPES
        access_ticket = self._get_access_ticket()
        xml = create_operation_request(
            operation=operation, cuit=self.cuit, access_ticket=access_ticket
        )
        response = self._transport.send(operation, xml)
        return parse_currency_types_response(response)

    def get_vat_receptor_condition(self):
        operation = OP.GET_VAT_RECEPTOR_CONDITION
        access_ticket = self._get_access_ticket()
        xml = create_operation_request(
            operation=operation, cuit=self.cuit, access_ticket=access_ticket
        )
        response = self._transport.send(operation, xml)
        return parse_vat_receptor_condition_response(response)
