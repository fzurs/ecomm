from dataclasses import dataclass
from datetime import datetime, date
from decimal import Decimal


@dataclass(frozen=True)
class VoucherBatch:
    quantity: int
    voucher_type: int
    point_of_sale: int


@dataclass(frozen=True)
class Voucher:
    concept: int
    document_type: int
    document_number: int
    voucher_from: int
    voucher_to: int
    voucher_date: date | None
    total_amount: Decimal
    non_taxable_amount: Decimal
    net_amount: Decimal
    exempt_amount: Decimal
    vat_amount: Decimal
    tax_amount: Decimal
    currency_code: str
    recipient_vat_condition_code: int


@dataclass(frozen=True)
class CreateVoucherRequest:
    header: VoucherBatch
    details: list[Voucher]


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
