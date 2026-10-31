from django.contrib import admin

from .models import RevocationRequest


@admin.register(RevocationRequest)
class RevocationRequestAdmin(admin.ModelAdmin):
    list_display = ["code", "order", "status", "created_at"]
    readonly_fields = [field.name for field in RevocationRequest._meta.fields]
