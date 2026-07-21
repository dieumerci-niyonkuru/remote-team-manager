from rest_framework import serializers
from .models import Workspace, WorkspaceMember, ActivityFeed
from apps.accounts.serializers import UserSerializer

class WorkspaceMemberSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = WorkspaceMember
        fields = ('id', 'user', 'role', 'joined_at')

class ActivityFeedSerializer(serializers.ModelSerializer):
    actor_name = serializers.SerializerMethodField()
    class Meta:
        model = ActivityFeed
        fields = ('id', 'actor', 'actor_name', 'action', 'object_type', 'object_id', 'object_name', 'timestamp')

    def get_actor_name(self, obj):
        if obj.actor:
            return obj.actor.get_full_name() or obj.actor.username
        return 'Unknown'

class WorkspaceSerializer(serializers.ModelSerializer):
    members = WorkspaceMemberSerializer(source='workspacemember_set', many=True, read_only=True)
    member_count = serializers.SerializerMethodField()
    project_count = serializers.SerializerMethodField()
    task_count = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()

    class Meta:
        model = Workspace
        fields = ('id', 'name', 'description', 'created_by', 'created_at', 'updated_at',
                  'members', 'member_count', 'project_count', 'task_count', 'role')
        read_only_fields = ('created_by',)

    def get_member_count(self, obj):
        return obj.workspacemember_set.count()

    def get_project_count(self, obj):
        try:
            return obj.projects.count()
        except Exception:
            return 0

    def get_task_count(self, obj):
        """Total tasks across every project in the workspace."""
        try:
            from apps.projects.models import Task
            return Task.objects.filter(project__workspace=obj).count()
        except Exception:
            return 0

    def get_role(self, obj):
        """The requesting user's role in this workspace, for permission-aware UI."""
        request = self.context.get('request')
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return None
        membership = obj.workspacemember_set.filter(user=user).first()
        return membership.role if membership else None
