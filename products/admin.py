from django.contrib import admin
from .models import Product, Inventory, Category

admin.site.register([Product, Inventory, Category])
