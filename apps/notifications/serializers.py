from rest_framework import serializers
from .models import Notification, Invite


class NotificationSerializer(serializers.ModelSerializer):
    # actor may be null (e.g. system notifications), so use SerializerMethodField
    actor_name = serializers.SerializerMethodField()
    actor_id = serializers.SerializerMethodField()
    actor_avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = Notification
        fields = [
            'id',
            'actor_id',
            'actor_name',
            'actor_avatar_url',
            'verb',
            'description',
            'priority',
            'category',
            'deep_link',
            'target_object_id',
            'timestamp',
            'unread',
        ]

    def get_actor_name(self, obj):
        if obj.actor:
            return obj.actor.get_full_name() or obj.actor.username
        return None

    def get_actor_id(self, obj):
        return obj.actor_id  # safe even when actor is None

    def get_actor_avatar_url(self, obj):
        if not obj.actor:
            return None
        request = self.context.get('request')
        avatar = getattr(obj.actor, 'avatar', None)
        if avatar and request:
            try:
                return request.build_absolute_uri(avatar.url)
            except Exception:
                pass
        return None


class InviteSerializer(serializers.ModelSerializer):
    workspace_name = serializers.CharField(source='workspace.name', read_only=True)
    invited_by_name = serializers.SerializerMethodField()

    def get_invited_by_name(self, obj):
        return obj.invited_by.get_full_name() or obj.invited_by.username

    class Meta:
        model = Invite
        fields = '__all__'
