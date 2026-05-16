from rest_framework import serializers
from .models import FriendRequest, FileAttachment
from apps.accounts.serializers import UserSerializer



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
