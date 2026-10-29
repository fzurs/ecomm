from django.contrib import admin

from billing.models import LIVE_STATUSES, Invoice
from .models import Order, OrderItem, Customer


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 2

    # The items of an order with a voucher are what ARCA authorized: they stay as they are.
    def invoiced(self, obj):
        return obj is not None and Invoice.objects.filter(order=obj, status__in=LIVE_STATUSES).exists()

    def has_add_permission(self, request, obj=None):
        return not self.invoiced(obj) and super().has_add_permission(request, obj)

    def has_change_permission(self, request, obj=None):
        return not self.invoiced(obj) and super().has_change_permission(request, obj)

    def has_delete_permission(self, request, obj=None):
        return not self.invoiced(obj) and super().has_delete_permission(request, obj)


class OrderAdmin(admin.ModelAdmin):
    inlines = [OrderItemInline]


admin.site.register(Order, OrderAdmin)
admin.site.register(Customer)
