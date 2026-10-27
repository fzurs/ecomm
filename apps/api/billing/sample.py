"""A WSFE that authorizes without calling ARCA, for the tests and the development seed."""
from collections import Counter
from datetime import date, timedelta
from decimal import Decimal

from arca_client import (
    CbteTipo,
    ComprobanteAutorizado,
    Concepto,
    DocTipo,
    IvaAlicuota,
    WSFEConnectionError,
    WSFEError,
)
from arca_client.wsfe import Mensaje

from . import amounts

# The seed's vouchers go to their own point of sale, so their made-up numbers never collide
# with the ones ARCA assigns on the real one.
SAMPLE_POINT_OF_SALE = 99


class SampleWSFE:
    """Emits like arca-client: numbers per type, IVA per rate on the aggregated base. The CAE is
    made up from the point of sale, type and number.

    `fail` makes the next emission fail: "rejected" (ARCA refuses it) or "unverified" (the
    connection drops and its fate is unknown).
    """

    def __init__(self, cuit=20111111112, today: date | None = None):
        self.cuit = cuit
        self.today = today or date.today()
        self.calls = []
        self.numbers = Counter()
        self.vouchers = {}
        self.error = None
        self.fail = None
        # ARCA's observations on the next authorized vouchers.
        self.observations = []
        self.errors = [Mensaje(10016, 'El numero o fecha del comprobante no se corresponde con el proximo a autorizar.')]

    def emit(self, tipo, punto_venta, *, neto=None, exento=0, no_gravado=0, importe_total=None,
             doc_tipo=DocTipo.CUIT, doc_nro, condicion_iva_receptor, asociado=None):
        if self.error:
            raise self.error
        if self.fail == 'rejected':
            raise WSFEError(self.errors)
        if self.fail == 'unverified':
            raise WSFEConnectionError(
                'ARCA no respondió y no se pudo verificar el comprobante: NO reintentes la emisión.',
                punto_venta=punto_venta, tipo=tipo, numero=self.numbers[tipo] + 1, safe_to_retry=False,
            )
        iva = [IvaAlicuota(rate, base, amounts.vat(base, rate)) for rate, base in (neto or {}).items()]
        net = sum((neto or {}).values(), Decimal(0))
        vat = sum((i.importe for i in iva), Decimal(0))
        if importe_total is None:
            importe_total = net + vat + exento + no_gravado
        self.numbers[tipo] += 1
        numero = self.numbers[tipo]
        voucher = ComprobanteAutorizado(
            cuit=self.cuit, punto_venta=punto_venta, tipo=tipo, numero=numero, fecha=self.today,
            importe_total=importe_total, cae=f'7{punto_venta:04d}{tipo:02d}{numero:07d}',
            cae_vencimiento=self.today + timedelta(days=10), concepto=Concepto.PRODUCTOS,
            doc_tipo=doc_tipo, doc_nro=doc_nro, condicion_iva_receptor=condicion_iva_receptor,
            observaciones=list(self.observations),
            importe_neto=net, importe_iva=vat, importe_exento=Decimal(exento),
            importe_no_gravado=Decimal(no_gravado), iva=iva, asociados=[asociado] if asociado else [],
        )
        self.vouchers[(punto_venta, tipo, numero)] = voucher
        return voucher

    def method(name, tipo):
        def create(self, punto_venta, **kwargs):
            self.calls.append((name, kwargs))
            return self.emit(tipo, punto_venta, **kwargs)
        return create

    create_invoice_a = method('create_invoice_a', CbteTipo.FACTURA_A)
    create_invoice_b = method('create_invoice_b', CbteTipo.FACTURA_B)
    create_invoice_c = method('create_invoice_c', CbteTipo.FACTURA_C)
    create_credit_note_a = method('create_credit_note_a', CbteTipo.NOTA_CREDITO_A)
    create_debit_note_a = method('create_debit_note_a', CbteTipo.NOTA_DEBITO_A)
    del method

    def get_voucher(self, punto_venta, tipo, numero):
        return self.vouchers.get((punto_venta, tipo, numero))
