from rest_framework import serializers
from .models import Product, Inventory


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        fields = serializers.ALL_FIELDS
        model = Product


class InventorySerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)

    class Meta:
        fields = serializers.ALL_FIELDS
        model = Inventory
