from django.contrib import admin
from .models import Invoice, InvoiceSequenceLock

admin.site.register([Invoice, InvoiceSequenceLock])
