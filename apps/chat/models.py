import uuid
from django.db import models
from django.conf import settings
from apps.workspaces.models import Workspace


class Channel(models.Model):
    class ChannelType(models.TextChoices):
        PUBLIC  = 'public',  'Public'
        PRIVATE = 'private', 'Private'
        DIRECT  = 'direct',  'Direct Message'

    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace   = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='channels')
    name        = models.CharField(max_length=100)
    description = models.TextField(blank=True, default='')
    channel_type = models.CharField(max_length=10, choices=ChannelType.choices, default=ChannelType.PUBLIC)
    created_by  = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='created_channels')
    members     = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='channels', blank=True)
    is_pinned   = models.BooleanField(default=False)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['name']
        unique_together = ['workspace', 'name']

    def __str__(self):
        return f'#{self.name}'


class Message(models.Model):
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    channel     = models.ForeignKey(Channel, on_delete=models.CASCADE, related_name='messages')
    author      = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='messages')
    content     = models.TextField()
    is_edited   = models.BooleanField(default=False)
    is_pinned   = models.BooleanField(default=False)
    reply_to    = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='replies')
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'{self.author.email}: {self.content[:50]}'


class Reaction(models.Model):
    id         = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    message    = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='reactions')
    user       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reactions')
    emoji      = models.CharField(max_length=10)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ['message', 'user', 'emoji']

    def __str__(self):
        return f'{self.emoji} by {self.user.email}'


class Comment(models.Model):
    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace    = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='comments')
    author       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='comments')
    content      = models.TextField()
    object_type  = models.CharField(max_length=50)
    object_id    = models.UUIDField()
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'Comment by {self.author.email} on {self.object_type}'
