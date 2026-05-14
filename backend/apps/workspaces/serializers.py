from rest_framework import serializers
from .models import Workspace, WorkspaceMember
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'avatar')

class WorkspaceMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = WorkspaceMember
        fields = ('id', 'user', 'role', 'is_active', 'joined_at')

class WorkspaceSerializer(serializers.ModelSerializer):
    member_count = serializers.SerializerMethodField()
    owner = UserSerializer(source='created_by', read_only=True)

    class Meta:
        model = Workspace
        fields = ('id', 'name', 'slug', 'description', 'owner', 'member_count', 'is_active', 'created_at')

    def get_member_count(self, obj):
        return obj.members.count()
