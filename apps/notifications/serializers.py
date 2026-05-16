from rest_framework import serializers
from .models import Notification, Invite

class NotificationSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source='actor.get_full_name', read_only=True)
    class Meta:
        model = Notification
        fields = ['id', 'actor_name', 'verb', 'target', 'timestamp', 'unread']

class InviteSerializer(serializers.ModelSerializer):
    workspace_name = serializers.CharField(source='workspace.name', read_only=True)
    invited_by_name = serializers.SerializerMethodField()

    def get_invited_by_name(self, obj):
        return obj.invited_by.get_full_name() or obj.invited_by.username
    class Meta:
        model = Invite
        fields = '__all__'
