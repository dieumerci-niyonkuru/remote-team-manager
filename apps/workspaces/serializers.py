from rest_framework import serializers
from .models import Workspace, WorkspaceMember, ActivityFeed
from apps.accounts.serializers import UserSerializer

class WorkspaceMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = WorkspaceMember
        fields = ('id', 'user', 'role', 'joined_at')

class ActivityFeedSerializer(serializers.ModelSerializer):
    actor_name = serializers.ReadOnlyField(source='actor.get_full_name')
    class Meta:
        model = ActivityFeed
        fields = ('id', 'actor', 'actor_name', 'action', 'object_type', 'object_id', 'object_name', 'timestamp')

class WorkspaceSerializer(serializers.ModelSerializer):
    members = WorkspaceMemberSerializer(source='workspacemember_set', many=True, read_only=True)
    class Meta:
        model = Workspace
        fields = ('id', 'name', 'description', 'created_by', 'created_at', 'updated_at', 'members')
        read_only_fields = ('created_by',)
