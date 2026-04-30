from rest_framework import serializers
from .models import Channel, Message, MessageReaction
from apps.accounts.serializers import UserSerializer

class MessageReactionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = MessageReaction
        fields = ('id', 'user', 'emoji')

class MessageSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    reactions = MessageReactionSerializer(many=True, read_only=True)
    class Meta:
        model = Message
        fields = ('id', 'channel', 'user', 'content', 'created_at', 'updated_at', 'reply_to', 'reactions')

class ChannelSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    class Meta:
        model = Channel
        fields = ('id', 'name', 'workspace', 'created_by', 'created_at', 'is_private', 'members', 'messages')
