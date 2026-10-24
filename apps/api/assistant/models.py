from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


class Conversation(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, models.CASCADE, related_name='assistant_conversations')
    title = models.CharField(max_length=255, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return self.title or f'Conversation #{self.pk}'


class Message(models.Model):
    class Role(models.TextChoices):
        USER = 'user', _('User')
        ASSISTANT = 'assistant', _('Assistant')

    conversation = models.ForeignKey(Conversation, models.CASCADE, related_name='messages')
    role = models.CharField(max_length=20, choices=Role.choices)
    # The content blocks exactly as sent to / received from the Claude API (thinking, tool_use
    # and tool_result included). They're sent back unchanged on every turn: the API rejects a
    # history whose earlier turns were edited.
    content = models.JSONField()
    # What the admin shows: the text the user typed, or the assistant's answer. Empty for the
    # turns that only carry tool calls or results.
    text = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f'{self.get_role_display()} message in {self.conversation}'
