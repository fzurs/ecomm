from enum import StrEnum


class Operation(StrEnum):
    CREATE_VOUCHER = "FECAEASolicitar"
    GET_CURRENCY_TYPES = "FEParamGetTiposMonedas"
    GET_VAT_RECEPTOR_CONDITION = "FEParamGetCondicionIvaReceptor"
