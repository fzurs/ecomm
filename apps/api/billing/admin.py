from django.contrib import admin
from .models import Invoice, InvoiceLine, InvoiceSequenceLock, InvoiceVat


class ReadOnlyMixin:
    """Vouchers are emitted and credited through the API only: here they can just be looked at.
    The database refuses changes to one with a CAE anyway (migration 0011)."""

    def has_add_permission(self, request, obj=None):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


class InvoiceLineInline(ReadOnlyMixin, admin.TabularInline):
    model = InvoiceLine


class InvoiceVatInline(ReadOnlyMixin, admin.TabularInline):
    model = InvoiceVat


@admin.register(Invoice)
class InvoiceAdmin(ReadOnlyMixin, admin.ModelAdmin):
    list_display = ['__str__', 'order', 'receptor_name', 'total_amount', 'issue_date']
    list_filter = ['status', 'voucher_type', 'point_of_sale']
    inlines = [InvoiceLineInline, InvoiceVatInline]


admin.site.register(InvoiceSequenceLock)
