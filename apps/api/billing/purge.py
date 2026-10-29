"""Deleting vouchers with a CAE, which the database refuses (migration 0011). Only the
development seed does it: its sample vouchers and, on request, the homologation ones."""
import getpass
import logging

from django.conf import settings
from django.db import connection

from .models import Invoice
from .sample import SAMPLE_POINT_OF_SALE


audit = logging.getLogger('audit')


class PurgeRefused(Exception):
    pass


def bypass_invoice_guard() -> None:
    """Lets the current transaction delete and change vouchers with a CAE, until it ends."""
    if not connection.in_atomic_block:
        raise RuntimeError('bypass_invoice_guard() needs a transaction: SET LOCAL would end right away.')
    with connection.cursor() as cursor:
        cursor.execute("SET LOCAL ecomm.allow_invoice_purge = 'on'")


def purge_invoices(*, homologation: bool) -> None:
    """Deletes every voucher. Those emitted to ARCA (outside `SAMPLE_POINT_OF_SALE`) only with
    `homologation`, and only while ARCA_ENVIRONMENT is homologacion: production numbering is a
    fiscal record."""
    if Invoice.objects.exclude(point_of_sale=SAMPLE_POINT_OF_SALE).exists():
        if not homologation:
            raise PurgeRefused('There are vouchers emitted to ARCA.')
        if settings.ARCA_ENVIRONMENT != 'homologacion':
            raise PurgeRefused(
                f'ARCA_ENVIRONMENT is {settings.ARCA_ENVIRONMENT}: vouchers emitted to ARCA are '
                'only deleted in homologacion.')
    emitted = Invoice.objects.exclude(point_of_sale=SAMPLE_POINT_OF_SALE).count()
    if emitted:
        audit.warning('purge: %d homologacion vouchers deleted by OS user %s', emitted, getpass.getuser())
    bypass_invoice_guard()
    # Notes first: they protect their invoice and the lines they credit.
    Invoice.objects.exclude(associated_invoice=None).delete()
    Invoice.objects.all().delete()
