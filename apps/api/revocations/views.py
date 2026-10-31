from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema
from rest_framework import filters, mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView

from config.authentication import CsrfSessionAuthentication
from config.exceptions import Conflict, ServiceUnavailable
from payments.gateway import GatewayError

from . import services
from .models import RevocationRequest
from .serializers import (
    RevocationApproveSerializer,
    RevocationCreatedSerializer,
    RevocationCreateSerializer,
    RevocationRejectSerializer,
    RevocationRequestSerializer,
)


class RevocationThrottle(AnonRateThrottle):
    # By IP, guests or not: guessing order numbers and emails gets slow.
    scope = "revocation"
    rate = "10/hour"

    def get_cache_key(self, request, view):
        return self.cache_format % {"scope": self.scope, "ident": self.get_ident(request)}


class RevocationCreateView(APIView):
    """The store's "botón de arrepentimiento": with the order's number and email, no session."""

    authentication_classes = [CsrfSessionAuthentication]
    permission_classes = [permissions.AllowAny]
    throttle_classes = [RevocationThrottle]

    @extend_schema(operation_id="revocations_request", request=RevocationCreateSerializer,
                   responses={201: RevocationCreatedSerializer})
    def post(self, request):
        serializer = RevocationCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        try:
            revocation = services.request_revocation(data["order_number"], data["email"], data.get("reason", ""))
        except services.RevocationError as exc:
            raise ValidationError({"detail": str(exc)})
        return Response(RevocationCreatedSerializer(revocation).data, status=status.HTTP_201_CREATED)


class RevocationRequestViewSet(mixins.ListModelMixin, mixins.RetrieveModelMixin, viewsets.GenericViewSet):
    """The requests, for the admin: approving refunds and credits the order (`services.approve`)."""

    queryset = RevocationRequest.objects.select_related("order__customer", "resolved_by")
    serializer_class = RevocationRequestSerializer
    lookup_field = "code"
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = ["status"]
    ordering_fields = ["created_at", "status"]
    search_fields = ["code", "order__number", "email", "order__customer__name"]

    def resolve(self, resolution):
        try:
            revocation = resolution(self.get_object())
        except services.RevocationError as exc:
            raise Conflict(str(exc))
        except GatewayError as exc:
            raise ServiceUnavailable(f"Mercado Pago didn't refund the payment: {exc}")
        return Response(self.get_serializer(revocation).data)

    @extend_schema(operation_id="revocations_approve", request=RevocationApproveSerializer,
                   responses=RevocationRequestSerializer)
    @action(detail=True, methods=["post"])
    def approve(self, request, code=None):
        serializer = RevocationApproveSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return self.resolve(lambda revocation: services.approve(
            revocation, request.user, **serializer.validated_data))

    @extend_schema(operation_id="revocations_reject", request=RevocationRejectSerializer,
                   responses=RevocationRequestSerializer)
    @action(detail=True, methods=["post"])
    def reject(self, request, code=None):
        serializer = RevocationRejectSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return self.resolve(lambda revocation: services.reject(
            revocation, request.user, serializer.validated_data["note"]))
