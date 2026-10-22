from django.contrib import admin
from .models import Product, Category, Brand


@admin.action
def generate_sku(modeladmin, request, queryset):
    for product in queryset:
        product.generate_sku()
    modeladmin.message_user(request, f'{queryset.count()} product(s) with new SKU.')


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    actions = [generate_sku]
    list_display = ['name', 'brand']


admin.site.register([Category, Brand])
