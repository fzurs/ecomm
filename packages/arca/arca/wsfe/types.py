from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal


@dataclass(frozen=True)
class CreateVoucherRequest:
    cant_reg: str
    cbte_tipo: int
    pto_vta: int
    concepto: str
    doc_tipo: str
    doc_nro: int
    cbte_desde: int
    cbte_hasta: int
    cbte_fch: datetime | None
    imp_total: Decimal
    imp_tot_conc: Decimal
    imp_neto: Decimal
    imp_op_ex: Decimal
    imp_iva: Decimal
    imp_trib: Decimal
    mon_id: str
    condicion_iva_receptor_id: str


@dataclass(frozen=True)
class CurrencyType:
    id: str
    description: str


@dataclass(frozen=True)
class VatReceptorCondition:
    id: int
    description: str
    voucher_class: str


@dataclass(frozen=True)
class WSFEMessage:
    code: int
    message: str


@dataclass
class CAEA:
    period: datetime
    order: int
