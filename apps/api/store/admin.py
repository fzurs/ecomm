from django.contrib import admin
from .models import Category, Brand, Product, Customer, Order

admin.site.register([Category, Brand, Product, Customer, Order])
