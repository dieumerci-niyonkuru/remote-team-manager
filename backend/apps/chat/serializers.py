from rest_framework import serializers
from .models import (
    Channel, Message, DirectMessage, ChannelMembership,
    MessageReaction, MessageEditHistory, MessageRead, FileAttachment
)
from apps.accounts.serializers import UserSerializer

class ChannelMembershipSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = ChannelMembership
        fields = ('id', 'user', 'joined_at', 'is_pending')

class ChannelSerializer(serializers.ModelSerializer):
    members = ChannelMembershipSerializer(source='memberships', many=True, read_only=True)
    is_member = serializers.SerializerMethodField()
    class Meta:
        model = Channel
        fields = '__all__'
        read_only_fields = ('created_by',)

    def get_is_member(self, obj):
        user = self.context['request'].user
        return obj.memberships.filter(user=user, is_pending=False).exists()

class MessageReactionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = MessageReaction
        fields = ('id', 'user', 'emoji')

class FileAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileAttachment
        fields = ('id', 'file', 'uploaded_at')

class MessageSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    reactions = MessageReactionSerializer(many=True, read_only=True)
    attachments = FileAttachmentSerializer(many=True, read_only=True)
    reply_count = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = '__all__'
        read_only_fields = ('user',)

    def get_reply_count(self, obj):
        return obj.replies.count()

class DirectMessageSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    messages = MessageSerializer(many=True, read_only=True)
    class Meta:
        model = DirectMessage
        fields = '__all__'
