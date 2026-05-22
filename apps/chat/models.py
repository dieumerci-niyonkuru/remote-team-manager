from django.db import models
from django.conf import settings
from apps.workspaces.models import Workspace


class ChatRoom(models.Model):
    ROOM_TYPES = (
        ('private', 'Private'),
        ('group', 'Group'),
        ('workspace', 'Workspace'),
    )

    name = models.CharField(max_length=255, blank=True, null=True)

    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        related_name='chat_rooms',
        blank=True,
        null=True
    )

    room_type = models.CharField(
        max_length=20,
        choices=ROOM_TYPES,
        default='group'
    )

    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='chat_rooms'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name or f"Room {self.id}"


class Message(models.Model):
    room = models.ForeignKey(
        ChatRoom,
        on_delete=models.CASCADE,
        related_name='messages'
    )

    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='sent_messages'
    )

    content = models.TextField()

    is_read = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.sender} -> {self.room}"
