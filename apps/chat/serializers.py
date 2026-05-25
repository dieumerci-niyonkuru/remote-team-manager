from rest_framework import serializers
from .models import ChatRoom, Message, MessageReaction, ReadReceipt
from apps.accounts.models import User


class UserMiniSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'full_name', 'avatar_url')

    def get_avatar_url(self, obj):
        request = self.context.get('request')
        if obj.avatar and request:
            return request.build_absolute_uri(obj.avatar.url)
        return None

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


class MessageReactionSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer(read_only=True)

    class Meta:
        model = MessageReaction
        fields = ('id', 'emoji', 'user', 'created_at')


class ReplyToSerializer(serializers.ModelSerializer):
    sender = UserMiniSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ('id', 'content', 'sender', 'created_at')


class MessageSerializer(serializers.ModelSerializer):
    sender = UserMiniSerializer(read_only=True)
    sender_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), source='sender', write_only=True, required=False
    )
    reactions = serializers.SerializerMethodField()
    reply_to = ReplyToSerializer(read_only=True)
    reply_to_id = serializers.PrimaryKeyRelatedField(
        queryset=Message.objects.all(), source='reply_to', write_only=True, required=False, allow_null=True
    )
    read_by_count = serializers.SerializerMethodField()
    reaction_summary = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = (
            'id', 'room', 'sender', 'sender_id', 'content',
            'reply_to', 'reply_to_id',
            'is_read', 'is_edited', 'is_deleted', 'is_pinned',
            'file_url', 'file_name', 'file_type',
            'reactions', 'reaction_summary', 'read_by_count',
            'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at', 'sender', 'is_edited')

    def get_reactions(self, obj):
        return MessageReactionSerializer(obj.reactions.select_related('user'), many=True).data

    def get_reaction_summary(self, obj):
        """Group reactions by emoji with count and user list."""
        summary = {}
        for r in obj.reactions.select_related('user'):
            if r.emoji not in summary:
                summary[r.emoji] = {'emoji': r.emoji, 'count': 0, 'users': []}
            summary[r.emoji]['count'] += 1
            summary[r.emoji]['users'].append(r.user.username)
        return list(summary.values())

    def get_read_by_count(self, obj):
        return obj.read_receipts.count()


class ChatRoomSerializer(serializers.ModelSerializer):
    participants = UserMiniSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    pinned_messages = serializers.SerializerMethodField()

    class Meta:
        model = ChatRoom
        fields = (
            'id', 'name', 'room_type', 'workspace',
            'participants', 'created_at',
            'last_message', 'unread_count', 'pinned_messages',
        )
        read_only_fields = ('id', 'created_at')

    def get_last_message(self, obj):
        msg = obj.messages.filter(is_deleted=False).order_by('-created_at').first()
        if msg:
            return {
                'id': msg.id,
                'content': msg.content[:80] if not msg.is_deleted else '[deleted]',
                'sender': msg.sender.username,
                'created_at': msg.created_at.isoformat(),
            }
        return None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if not request:
            return 0
        return obj.messages.filter(is_read=False, is_deleted=False).exclude(sender=request.user).count()

    def get_pinned_messages(self, obj):
        pinned = obj.messages.filter(is_pinned=True, is_deleted=False).order_by('-created_at')[:5]
        return MessageSerializer(pinned, many=True, context=self.context).data
