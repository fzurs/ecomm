from django.contrib import admin
from .models import Order, OrderItem, Customer


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 2


class OrderAdmin(admin.ModelAdmin):
    inlines = [OrderItemInline]


admin.site.register(Order, OrderAdmin)
admin.site.register(Customer)
