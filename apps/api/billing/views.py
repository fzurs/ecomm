from contextlib import contextmanager

from django.http import HttpResponse
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiResponse, extend_schema, extend_schema_view
from rest_framework import mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.response import Response

from . import services
from .filters import InvoiceFilter
from .models import Invoice
from .pdf import invoice_pdf
from .rules import InvoicingError
from .serializers import (
    CreditNoteCreateSerializer,
    DebitNoteCreateSerializer,
    InvoiceCreateSerializer,
    InvoiceDetailSerializer,
    InvoicePreviewSerializer,
    InvoiceSerializer,
)


@contextmanager
def invoicing_errors():
    """Answers a voucher that can't be made with a 400 that the admin shows as is."""
    try:
        yield
    except InvoicingError as e:
        raise ValidationError({"detail": str(e)}) from e


# Vouchers are fiscal records: they are never edited, and only a rejected one (never
# authorized by ARCA) can be deleted. Creating one emits it: the response has the status it
# ended in (authorized, rejected or unverified).
@extend_schema_view(
    create=extend_schema(request=InvoiceCreateSerializer, responses={201: InvoiceDetailSerializer}),
)
class InvoiceViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    queryset = Invoice.objects.select_related("order__customer").order_by("-created_at")
    serializer_class = InvoiceSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter, SearchFilter]
    filterset_class = InvoiceFilter
    ordering_fields = ["issue_date", "number", "total_amount", "status", "created_at"]
    search_fields = ["order__number", "order__customer__name", "receptor_name", "cae", "=number"]

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action != "list":
            queryset = queryset.select_related("associated_invoice").prefetch_related(
                "lines", "vat", "notes")
        return queryset

    def get_serializer_class(self):
        if self.action == "list":
            return InvoiceSerializer
        return InvoiceDetailSerializer

    def detail_response(self, invoice, status_code=status.HTTP_200_OK):
        invoice = self.get_queryset().get(pk=invoice.pk)
        return Response(InvoiceDetailSerializer(invoice).data, status=status_code)

    def create(self, request, *args, **kwargs):
        serializer = InvoiceCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        with invoicing_errors():
            invoice = services.create_invoice(serializer.validated_data["order"])
        return self.detail_response(invoice, status.HTTP_201_CREATED)

    def perform_destroy(self, instance):
        if instance.status != Invoice.Status.REJECTED:
            raise ValidationError({"detail": "Only a rejected voucher can be deleted."})
        instance.delete()

    @extend_schema(
        operation_id="invoices_preview",
        request=InvoiceCreateSerializer,
        responses=InvoicePreviewSerializer,
    )
    @action(detail=False, methods=["post"])
    def preview(self, request):
        """What creating the invoice of the order would emit. Doesn't call ARCA."""
        serializer = InvoiceCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.validated_data["order"]
        rejected = order.invoices.filter(associated_invoice=None, status=Invoice.Status.REJECTED).first()
        with invoicing_errors():
            invoice, lines = services.build_invoice(order, rejected)
        invoice.preview_lines = lines
        return Response(InvoicePreviewSerializer(invoice).data)

    @extend_schema(operation_id="invoices_emit", request=None, responses=InvoiceDetailSerializer)
    @action(detail=True, methods=["post"])
    def emit(self, request, pk=None):
        """Emits a rejected voucher again."""
        with invoicing_errors():
            invoice = services.retry(self.get_object())
        return self.detail_response(invoice)

    @extend_schema(operation_id="invoices_verify", request=None, responses=InvoiceDetailSerializer)
    @action(detail=True, methods=["post"])
    def verify(self, request, pk=None):
        """Asks ARCA whether an unverified voucher was authorized."""
        with invoicing_errors():
            invoice = services.verify(self.get_object())
        return self.detail_response(invoice)

    @extend_schema(
        operation_id="invoices_credit_note",
        request=CreditNoteCreateSerializer,
        responses={201: InvoiceDetailSerializer},
    )
    @action(detail=True, methods=["post"], url_path="credit-note")
    def credit_note(self, request, pk=None):
        """Emits a credit note for the given lines, or for everything left to credit."""
        serializer = CreditNoteCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        lines = serializer.validated_data.get("lines")
        if lines is not None:
            lines = [(line["line"], line["quantity"]) for line in lines]
        with invoicing_errors():
            note = services.create_credit_note(self.get_object(), lines)
        return self.detail_response(note, status.HTTP_201_CREATED)

    @extend_schema(
        operation_id="invoices_debit_note",
        request=DebitNoteCreateSerializer,
        responses={201: InvoiceDetailSerializer},
    )
    @action(detail=True, methods=["post"], url_path="debit-note")
    def debit_note(self, request, pk=None):
        serializer = DebitNoteCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        with invoicing_errors():
            note = services.create_debit_note(self.get_object(), serializer.validated_data["lines"])
        return self.detail_response(note, status.HTTP_201_CREATED)

    @extend_schema(
        operation_id="invoices_pdf",
        responses={(200, "application/pdf"): OpenApiResponse(OpenApiTypes.BINARY)},
    )
    @action(detail=True, methods=["get"])
    def pdf(self, request, pk=None):
        invoice = self.get_object()
        with invoicing_errors():
            content = invoice_pdf(invoice)
        name = f"{invoice.type.label} {invoice.display_number}.pdf".replace(" ", "_")
        return HttpResponse(
            content,
            content_type="application/pdf",
            headers={"Content-Disposition": f'inline; filename="{name}"'},
        )
