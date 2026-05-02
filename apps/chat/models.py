from django.db import models
from django.conf import settings
from apps.workspaces.models import Workspace

class Channel(models.Model):
    name = models.CharField(max_length=100)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='channels')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    is_private = models.BooleanField(default=False)
    is_default = models.BooleanField(default=False)
    members = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='chat_channels', blank=True)

class ChannelMembership(models.Model):
    channel = models.ForeignKey(Channel, on_delete=models.CASCADE, related_name='memberships')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)
    is_pending = models.BooleanField(default=False)  # for join requests

    class Meta:
        unique_together = ('channel', 'user')

class Message(models.Model):
    channel = models.ForeignKey(Channel, on_delete=models.CASCADE, related_name='messages', null=True, blank=True)
    direct_message = models.ForeignKey('DirectMessage', on_delete=models.CASCADE, related_name='messages', null=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    reply_to = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True)

class DirectMessage(models.Model):
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='direct_messages')
    created_at = models.DateTimeField(auto_now_add=True)

class MessageReaction(models.Model):
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='reactions')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    emoji = models.CharField(max_length=10)
