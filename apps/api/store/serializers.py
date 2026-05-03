from rest_framework import serializers
from .models import Product, Category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = serializers.ALL_FIELDS


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True, allow_null=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        write_only=True,
        source="category",
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Product
        fields = serializers.ALL_FIELDS
