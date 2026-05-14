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
    ROLE_CHOICES = [
        ('owner', 'Owner'),
        ('admin', 'Admin'),
        ('member', 'Member'),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='member')
    is_pending = models.BooleanField(default=False)  # for join requests

    class Meta:
        unique_together = ('channel', 'user')

class DirectMessage(models.Model):
    participants = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='direct_messages')
    created_at = models.DateTimeField(auto_now_add=True)

class Message(models.Model):
    channel = models.ForeignKey(Channel, on_delete=models.CASCADE, related_name='messages', null=True, blank=True)
    direct_message = models.ForeignKey('DirectMessage', on_delete=models.CASCADE, related_name='messages', null=True, blank=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    edited_at = models.DateTimeField(null=True, blank=True)
    reply_to = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='replies')
    thread_root = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='thread_messages')
    is_pinned = models.BooleanField(default=False)


class MessageEditHistory(models.Model):
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='edit_history')
    editor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    old_content = models.TextField()
    new_content = models.TextField()
    edited_at = models.DateTimeField(auto_now_add=True)

class MessageRead(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='read_by')
    read_at = models.DateTimeField(auto_now=True)

class TypingIndicator(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    channel = models.ForeignKey(Channel, on_delete=models.CASCADE, null=True, blank=True)
    last_typing = models.DateTimeField(auto_now=True)

class FileAttachment(models.Model):
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='chat/')
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='chat_file_attachments')
    uploaded_at = models.DateTimeField(auto_now_add=True)

class MessageReaction(models.Model):
    message = models.ForeignKey(Message, on_delete=models.CASCADE, related_name='reactions')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    emoji = models.CharField(max_length=10)

class Notification(models.Model):
    NOTIF_TYPES = [
        ('mention', 'Mention'),
        ('reaction', 'Reaction'),
        ('pin', 'Pin'),
        ('thread', 'Thread'),
        ('dm', 'Direct Message'),
        ('channel_invite', 'Channel Invite'),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='chat_notifications')
    type = models.CharField(max_length=20, choices=NOTIF_TYPES)
    payload = models.JSONField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

class UserPresence(models.Model):
    STATUS_CHOICES = [
        ('online', 'Online'),
        ('offline', 'Offline'),
        ('away', 'Away'),
    ]
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='chat_presence')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='offline')
    last_active = models.DateTimeField(auto_now=True)

class AnalyticsEvent(models.Model):
    EVENT_TYPES = [
        ('message_sent', 'Message Sent'),
        ('reaction_added', 'Reaction Added'),
        ('channel_created', 'Channel Created'),
        ('user_login', 'User Login'),
    ]
    event_type = models.CharField(max_length=30, choices=EVENT_TYPES)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    channel = models.ForeignKey(Channel, on_delete=models.SET_NULL, null=True, blank=True)
    payload = models.JSONField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
