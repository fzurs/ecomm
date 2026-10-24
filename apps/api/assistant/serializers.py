from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers
from .models import Conversation, Message


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ["id", "role", "text", "created_at"]


class ConversationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conversation
        fields = ["id", "title", "created_at", "updated_at"]
        read_only_fields = ["title"]


class ConversationDetailSerializer(ConversationSerializer):
    messages = serializers.SerializerMethodField()

    class Meta(ConversationSerializer.Meta):
        fields = ConversationSerializer.Meta.fields + ["messages"]

    # Only the messages the admin shows: the turns that carry only tool calls or results have no text.
    @extend_schema_field(MessageSerializer(many=True))
    def get_messages(self, conversation):
        return MessageSerializer(conversation.messages.exclude(text=""), many=True).data


class ReplySerializer(serializers.Serializer):
    text = serializers.CharField(max_length=4000)
    page = serializers.CharField(max_length=255, required=False, allow_blank=True)
