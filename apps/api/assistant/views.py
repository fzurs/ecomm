import json

from django.conf import settings
from django.http import StreamingHttpResponse
from drf_spectacular.utils import extend_schema
from rest_framework import mixins, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Conversation
from .serializers import ConversationDetailSerializer, ConversationSerializer, ReplySerializer
from .service import reply


def sse(events):
    for event, data in events:
        yield f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


# Staff only: the assistant reads every order, customer and invoice. Each user sees only
# their own conversations.
class ConversationViewSet(mixins.CreateModelMixin, mixins.ListModelMixin, mixins.RetrieveModelMixin,
                          mixins.DestroyModelMixin, viewsets.GenericViewSet):
    permission_classes = [permissions.IsAdminUser]

    queryset = Conversation.objects.all()

    def get_queryset(self):
        return super().get_queryset().filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ConversationDetailSerializer
        if self.action == "reply":
            return ReplySerializer
        return ConversationSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    # A server-sent events stream (text, tool, error and done events), which the generated
    # axios client can't consume: the admin reads it with fetch, so it's left out of the schema.
    @extend_schema(exclude=True)
    @action(detail=True, methods=["post"])
    def reply(self, request, pk=None):
        conversation = self.get_object()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if not settings.ANTHROPIC_API_KEY:
            return Response({"detail": "The assistant isn't configured (ANTHROPIC_API_KEY)."},
                            status=status.HTTP_503_SERVICE_UNAVAILABLE)
        events = reply(conversation, serializer.validated_data["text"], serializer.validated_data.get("page"))
        response = StreamingHttpResponse(sse(events), content_type="text/event-stream")
        response["Cache-Control"] = "no-cache"
        response["X-Accel-Buffering"] = "no"
        return response
