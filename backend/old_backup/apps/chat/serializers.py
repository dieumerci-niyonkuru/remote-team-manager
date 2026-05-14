from rest_framework import serializers
from .models import Channel, Message, Reaction
from apps.users.serializers import UserSerializer

class ChannelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Channel
        fields = ['id', 'name', 'description', 'created_at']
        read_only_fields = ['id', 'created_at']

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    reactions = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = ['id', 'sender', 'content', 'created_at', 'reactions']
        read_only_fields = ['id', 'sender', 'created_at']

    def get_reactions(self, obj):
        return [{'emoji': r.emoji, 'user': r.user.id} for r in obj.reactions.all()]
