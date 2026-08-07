from rest_framework import serializers
from .models import Product, Category, Brand


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = serializers.ALL_FIELDS


class BrandChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ["id", "name", "slug"]


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = serializers.ALL_FIELDS


class CategoryChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug", "description"]


class ProductChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = ["id", "name", "slug", "price"]


class ProductSerializer(serializers.ModelSerializer):
    brand = BrandSerializer(read_only=True, allow_null=True)
    brand_id = serializers.PrimaryKeyRelatedField(
        queryset=Brand.objects.all(),
        # write_only=True,
        source="brand",
        required=False,
        allow_null=True,
    )

    category = CategorySerializer(read_only=True, allow_null=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        # write_only=True,
        source="category",
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Product
        fields = serializers.ALL_FIELDS
        read_only_fields = ["created_at"]

    def create(self, validated_data):
        instance = super().create(validated_data)
        if instance.sku == None: instance.generate_sku()
        if instance.brand == None: instance.detect_and_assign_brand()
        return instance
            