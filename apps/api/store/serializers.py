from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Customer, Category, Brand, Product, Order

UserModel = get_user_model()


class UserDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModel
        fields = ["id", "first_name", "last_name", "email", "username", "is_staff"]


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = serializers.ALL_FIELDS


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = serializers.ALL_FIELDS


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = serializers.ALL_FIELDS


class ProductSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        source="category",
        queryset=Category.objects.all(),
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Product
        fields = serializers.ALL_FIELDS


class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = serializers.ALL_FIELDS
