from rest_framework.viewsets import ModelViewSet
from .models import Invoice
from .serializers import InvoiceSerializer
from .services import emit_invoice


class InvoiceViewSet(ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer

    # def perform_create(self, serializer):
    #     invoice = serializer.save()
    #     emit_invoice(invoice)
