from rest_framework import serializers
from .models import DirectMessage, FriendRequest, FileAttachment
from apps.accounts.serializers import UserSerializer

class DirectMessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)
    class Meta:
        model = DirectMessage
        fields = '__all__'
        read_only_fields = ('sender', 'timestamp')

class FriendRequestSerializer(serializers.ModelSerializer):
    from_user = UserSerializer(read_only=True)
    to_user = UserSerializer(read_only=True)
    class Meta:
        model = FriendRequest
        fields = '__all__'

class FileAttachmentSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)
    class Meta:
        model = FileAttachment
        fields = '__all__'
        read_only_fields = ('uploaded_by', 'uploaded_at')
