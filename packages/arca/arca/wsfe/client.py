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
    SERVICE = "wsfe"

    def __init__(self, cuit: str, wsaa_client: WSAAClient):
        self._cuit = cuit
        self._wsaa_client = wsaa_client
        self._transport = WSFETransport()

    def get_last_voucher(self, point_of_sale: int, voucher_type: int) -> int:
        access_ticket = self._wsaa_client.get_access_ticket(service=self.SERVICE)

        xml = create_get_last_voucher_request(
            point_of_sale,
            voucher_type,
            cuit=self._cuit,
            access_ticket=access_ticket,
        )

        response = self._transport.send(OP.GET_LAST_VOUCHER, xml)

        errors = parse_errors(response)
        if errors:
            raise WSFEError(errors)

        return parse_get_last_voucher_response(response)

    def create_voucher(self, request: CreateVoucherRequest, caea: CAEA):
        access_ticket = self._wsaa_client.get_access_ticket(service=self.SERVICE)

        xml = build_create_voucher_request(
            request=request, cuit=self._cuit, access_ticket=access_ticket, caea=caea
        )

        response = self._transport.send(OP.CREATE_VOUCHER, xml)

        errors = parse_errors(response)
        if errors:
            raise WSFEError(errors)

        return response

    def get_currency_types(self):
        access_ticket = self._wsaa_client.get_access_ticket(service=self.SERVICE)

        xml = create_operation_request(
            operation=OP.GET_CURRENCY_TYPES,
            cuit=self._cuit,
            access_ticket=access_ticket,
        )

        response = self._transport.send(OP.GET_CURRENCY_TYPES, xml)

        return parse_currency_types_response(response)

    def get_vat_receptor_condition(self):
        access_ticket = self._wsaa_client.get_access_ticket(service=self.SERVICE)

        xml = create_operation_request(
            operation=OP.GET_VAT_RECEPTOR_CONDITION,
            cuit=self._cuit,
            access_ticket=access_ticket,
        )

        response = self._transport.send(OP.GET_VAT_RECEPTOR_CONDITION, xml)

        return parse_vat_receptor_condition_response(response)
