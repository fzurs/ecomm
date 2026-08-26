from ..wsaa.client import WSAAClient

from .transport import WSFETransport
from .types import CreateVoucherRequest
from .requests import build_create_voucher_request, create_operation_request
from .operations import Operation as OP
from .responses import (
    parse_currency_types_response,
    parse_vat_receptor_condition_response,
)


class WSFEClient:
    def __init__(self, cuit: str, wsaa_client: WSAAClient):
        self.cuit = cuit
        self.wsaa_client = wsaa_client
        self.transport = WSFETransport()

    def create_voucher(self, request: CreateVoucherRequest):
        access_ticket = self.wsaa_client.get_access_ticket("wsfe")
        xml = build_create_voucher_request(request, self.cuit, access_ticket)
        response = self.transport.send(OP.CREATE_VOUCHER, xml)

        print(response.status_code)
        print(response.text)

    def get_currency_types(self):
        operation = OP.GET_CURRENCY_TYPES
        access_ticket = self.wsaa_client.get_access_ticket()
        xml = create_operation_request(operation, self.cuit, access_ticket)
        response = self.transport.send(operation, xml)
        return parse_currency_types_response(response.text)

    def get_vat_receptor_condition(self):
        operation = OP.GET_VAT_RECEPTOR_CONDITION
        access_ticket = self.wsaa_client.get_access_ticket()
        xml = create_operation_request(operation, self.cuit, access_ticket)
        response = self.transport.send(operation, xml)
        return parse_vat_receptor_condition_response(response.text)
