import django_filters
from config.filters import OperatorFilterSet
from orders.models import Customer
from .models import VOUCHER_TYPES, Invoice, VoucherKind, VoucherType


class InvoiceFilter(OperatorFilterSet):
    operators = {
        "total_amount": "number",
        "issue_date": "date",
        "created_at": "date",
    }

    # Option filters: the bare name is "any of", `__not` is "none of".
    status = django_filters.MultipleChoiceFilter(choices=Invoice.Status.choices)
    status__not = django_filters.MultipleChoiceFilter(field_name="status", choices=Invoice.Status.choices, exclude=True)
    voucher_type = django_filters.MultipleChoiceFilter(choices=VoucherType.choices)
    voucher_type__not = django_filters.MultipleChoiceFilter(field_name="voucher_type", choices=VoucherType.choices, exclude=True)
    kind = django_filters.MultipleChoiceFilter(choices=VoucherKind.choices, method="filter_kind")
    customer = django_filters.ModelMultipleChoiceFilter(field_name="order__customer", queryset=Customer.objects.all())
    customer__not = django_filters.ModelMultipleChoiceFilter(field_name="order__customer", queryset=Customer.objects.all(), exclude=True)
    order = django_filters.NumberFilter()

    class Meta:
        model = Invoice
        fields = []

    def filter_kind(self, queryset, name, value):
        types = [voucher_type for voucher_type, (_, kind) in VOUCHER_TYPES.items() if kind in value]
        return queryset.filter(voucher_type__in=types)
