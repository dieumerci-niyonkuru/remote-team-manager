from rest_framework import serializers
from .models import ChatRoom, Message
from apps.accounts.models import User


class UserMiniSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'avatar_url')

    def get_avatar_url(self, obj):
        request = self.context.get('request')
        if obj.avatar and request:
            return request.build_absolute_uri(obj.avatar.url)
        return None


class MessageSerializer(serializers.ModelSerializer):
    sender = UserMiniSerializer(read_only=True)
    sender_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='sender', write_only=True, required=False
    )

    class Meta:
        model = Message
        fields = ('id', 'room', 'sender', 'sender_id', 'content', 'is_read', 'created_at')
        read_only_fields = ('id', 'created_at', 'sender')


class ChatRoomSerializer(serializers.ModelSerializer):
    participants = UserMiniSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = ('id', 'name', 'room_type', 'workspace', 'participants', 'created_at', 'last_message', 'unread_count')
        read_only_fields = ('id', 'created_at')

    def get_last_message(self, obj):
        msg = obj.messages.order_by('-created_at').first()
        if msg:
            return {
                'content': msg.content[:80],
                'sender': msg.sender.username,
                'created_at': msg.created_at.isoformat(),
            }
        return None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if not request:
            return 0
        return obj.messages.filter(is_read=False).exclude(sender=request.user).count()
