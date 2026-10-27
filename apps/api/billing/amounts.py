"""Voucher amounts from the invoice lines, computed the way arca-client does.

The adapter (what is sent to ARCA), the estimate saved before emitting and the PDF items all
come from `to_items`, so the PDF always matches what ARCA authorized: `render_invoice_pdf` checks
that `neto_por_alicuota(items)` equals the authorized IVA bases.
"""
from collections.abc import Iterable
from dataclasses import replace
from decimal import ROUND_HALF_EVEN, Decimal

from arca_client import Alicuota, Item, neto_por_alicuota

from store.models import VatRate

CENTS = Decimal('0.01')
# Net unit prices keep 6 decimals: the item amount is rounded to cents after the quantity.
UNIT_PRICE_PLACES = Decimal('0.000001')


def alicuota(vat_rate: int) -> Alicuota | None:
    """The arca-client rate of a `VatRate`; None for non-taxed and exempt."""
    if vat_rate in (VatRate.NON_TAXED, VatRate.EXEMPT):
        return None
    return Alicuota(vat_rate)


def line_to_item(line, letter: str) -> Item:
    """An item from an `InvoiceLine`, whose prices include IVA: A and B take the net price with
    the rate; C (no IVA breakdown) and non-taxed or exempt lines, the price as is."""
    rate = alicuota(line.vat_rate) if letter != 'C' else None
    price = Decimal(line.unit_price)
    if rate is not None:
        price = (price / (1 + rate.porcentaje / 100)).quantize(UNIT_PRICE_PLACES, ROUND_HALF_EVEN)
    return Item(
        descripcion=line.description,
        precio_unitario=price,
        cantidad=Decimal(line.quantity),
        alicuota=rate,
    )


def net_for(gross: Decimal, rate: Alicuota) -> Decimal:
    """The net amount whose IVA adds up to `gross`, when there is one (or the closest)."""
    net = (gross / (1 + rate.porcentaje / 100)).quantize(CENTS, ROUND_HALF_EVEN)
    for candidate in (net, net - CENTS, net + CENTS):
        if candidate + vat(candidate, rate) == gross:
            return candidate
    return net


def to_items(lines: Iterable, letter: str) -> list[Item]:
    """The items of the voucher. Rounding each line's net amount can move the total some cents
    off what was charged, so the last line of each rate absorbs the difference: net plus IVA
    is the gross amount of that rate whenever possible."""
    lines = list(lines)
    items = [line_to_item(line, letter) for line in lines]
    last = {}
    for index, item in enumerate(items):
        if item.alicuota is not None:
            last[item.alicuota] = index
    for rate, index in last.items():
        gross = sum((line.subtotal for line in lines if alicuota(line.vat_rate) == rate), Decimal(0))
        current = sum((item.subtotal for item in items if item.alicuota == rate), Decimal(0))
        difference = net_for(gross, rate) - current
        if difference:
            item = items[index]
            price = (item.subtotal + difference) / item.cantidad
            items[index] = replace(item, precio_unitario=price.quantize(UNIT_PRICE_PLACES, ROUND_HALF_EVEN))
    return items


def voucher_amounts(lines: Iterable, letter: str) -> dict:
    """The amount kwargs of the arca-client `create_*` call for these lines."""
    lines = list(lines)
    items = to_items(lines, letter)
    if letter == 'C':
        return {'importe_total': sum((item.subtotal for item in items), Decimal(0))}

    def untaxed(vat_rate):
        return sum(
            (item.subtotal for item, line in zip(items, lines) if line.vat_rate == vat_rate),
            Decimal(0),
        )

    return {
        'neto': neto_por_alicuota(items),
        'exento': untaxed(VatRate.EXEMPT),
        'no_gravado': untaxed(VatRate.NON_TAXED),
    }


def vat(base: Decimal, rate: Alicuota) -> Decimal:
    return (base * rate.porcentaje / 100).quantize(CENTS, ROUND_HALF_EVEN)


def estimate(lines: Iterable, letter: str) -> dict:
    """The Invoice amount fields these lines will have once authorized."""
    amounts = voucher_amounts(lines, letter)
    if letter == 'C':
        total = amounts['importe_total']
        return {
            'net_amount': total, 'vat_amount': Decimal(0), 'exempt_amount': Decimal(0),
            'non_taxed_amount': Decimal(0), 'total_amount': total,
        }
    net = sum(amounts['neto'].values(), Decimal(0))
    vat_amount = sum((vat(base, rate) for rate, base in amounts['neto'].items()), Decimal(0))
    return {
        'net_amount': net,
        'vat_amount': vat_amount,
        'exempt_amount': amounts['exento'],
        'non_taxed_amount': amounts['no_gravado'],
        'total_amount': net + vat_amount + amounts['exento'] + amounts['no_gravado'],
    }
