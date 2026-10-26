import django_filters
from django.db import models

# Lookups per kind of field, as {param suffix: lookup_expr}. The empty suffix is the bare field
# name. Each one also gets a `not` variant (`price__not`, `price__not_range`...) that excludes.
OPERATOR_LOOKUPS = {
    "text": {"icontains": "icontains"},
    "number": {
        "": "exact", "lt": "lt", "lte": "lte", "gt": "gt", "gte": "gte", "range": "range",
    },
}
OPERATOR_LOOKUPS["date"] = OPERATOR_LOOKUPS["number"]

NEGATED = {
    "text": {"icontains"},
    "number": {"", "range"},
    "date": {"", "range"},
}


class OperatorFilterSet(django_filters.FilterSet):
    """Generates a filter per operator of the admin table filters from `operators`.

    `operators = {"price": "number"}` yields `price`, `price__not`, `price__lt`, `price__lte`,
    `price__gt`, `price__gte`, `price__range` and `price__not_range`. On a DateTimeField, the
    `date` kind compares the day (`created_at=2026-10-03` matches the whole day).
    """

    operators = {}

    @classmethod
    def get_filters(cls):
        filters = super().get_filters()
        if cls._meta.model is None:
            return filters

        for field_name, kind in cls.operators.items():
            field = cls._meta.model._meta.get_field(field_name)
            for suffix, lookup_expr in OPERATOR_LOOKUPS[kind].items():
                if kind == "date" and isinstance(field, models.DateTimeField):
                    lookup_expr = "date" if lookup_expr == "exact" else f"date__{lookup_expr}"

                name = f"{field_name}__{suffix}" if suffix else field_name
                filters[name] = cls.filter_for_field(field, field_name, lookup_expr)

                if suffix in NEGATED[kind]:
                    negated = cls.filter_for_field(field, field_name, lookup_expr)
                    negated.exclude = True
                    filters[f"{field_name}__not_{suffix}" if suffix else f"{field_name}__not"] = negated
        return filters
