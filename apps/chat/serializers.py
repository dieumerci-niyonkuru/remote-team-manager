from rest_framework import serializers
from .models import ChatRoom, ChatMessage
from apps.accounts.serializers import UserSerializer

class ChatRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatRoom
        fields = '__all__'
        read_only_fields = ('created_by',)

class ChatMessageSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = ChatMessage
        fields = '__all__'
