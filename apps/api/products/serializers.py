from rest_framework import serializers
from .models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = serializers.ALL_FIELDS


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = serializers.ALL_FIELDS
