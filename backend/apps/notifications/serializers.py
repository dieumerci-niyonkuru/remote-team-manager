from rest_framework import serializers
from .models import Notification, Invite

class NotificationSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source='actor.get_full_name', read_only=True)
    class Meta:
        model = Notification
        fields = ['id', 'actor_name', 'verb', 'target', 'timestamp', 'unread']

class InviteSerializer(serializers.ModelSerializer):
    workspace_name = serializers.CharField(source='workspace.name', read_only=True)
    invited_by_name = serializers.CharField(source='invited_by.username', read_only=True)

    class Meta:
        model = Invite
        fields = ['id', 'workspace', 'workspace_name', 'email', 'role', 'invited_by_name', 'accepted', 'expires_at']
