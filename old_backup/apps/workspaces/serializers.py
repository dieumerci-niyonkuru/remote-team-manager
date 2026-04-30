from rest_framework import serializers
from .models import Workspace, WorkspaceMember
from apps.users.serializers import UserSerializer


class WorkspaceMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model  = WorkspaceMember
        fields = ['id', 'user', 'role', 'joined_at']


class WorkspaceSerializer(serializers.ModelSerializer):
    owner        = UserSerializer(read_only=True)
    member_count = serializers.SerializerMethodField()

    class Meta:
        model  = Workspace
        fields = ['id', 'name', 'description', 'owner', 'member_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'owner', 'created_at', 'updated_at']

    def get_member_count(self, obj):
        return obj.members.count()


class CreateWorkspaceSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Workspace
        fields = ['name', 'description']


class InviteMemberSerializer(serializers.Serializer):
    email = serializers.EmailField()
    role  = serializers.ChoiceField(
        choices=[
            WorkspaceMember.Role.MANAGER,
            WorkspaceMember.Role.DEVELOPER,
            WorkspaceMember.Role.VIEWER,
        ]
    )
