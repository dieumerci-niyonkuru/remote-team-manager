from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source='actor.get_full_name', read_only=True)
    class Meta:
        model = Notification
        fields = ['id', 'actor_name', 'verb', 'target', 'timestamp', 'unread']
