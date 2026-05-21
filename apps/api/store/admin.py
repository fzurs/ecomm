from django.contrib import admin, messages
from .models import Product, Category, Brand


@admin.action
def detect_and_assign_brand(modeladmin, request, queryset):
    assigned = 0
    unbranded = 0
    for product in queryset:
        if product.detect_and_assign_brand():
            assigned += 1
        else:
            unbranded += 1
    if assigned:
        modeladmin.message_user(
            request, f'{assigned} product(s) with the correct brand assigned.', messages.SUCCESS)
    if unbranded:
        modeladmin.message_user(
            request, f'{unbranded} producto(s) no coincidieron con ninguna marca.', messages.WARNING)

@admin.action
def generate_sku(modeladmin, request, queryset):
    for product in queryset:
        product.generate_sku()
    modeladmin.message_user(request, f'{queryset.count()} product(s) with new SKU.')


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    actions = [detect_and_assign_brand, generate_sku]
    list_display = ['name', 'brand']


admin.site.register([Category, Brand])
