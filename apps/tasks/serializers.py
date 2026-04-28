from rest_framework import serializers
from .models import Task, Subtask, TimeLog, ActivityFeed
from apps.users.serializers import UserSerializer


class SubtaskSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Subtask
        fields = ['id', 'title', 'is_completed', 'created_at']
        read_only_fields = ['id', 'created_at']


class TimeLogSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model  = TimeLog
        fields = ['id', 'user', 'hours', 'description', 'logged_at', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']


class TaskSerializer(serializers.ModelSerializer):
    assignee   = UserSerializer(read_only=True)
    created_by = UserSerializer(read_only=True)
    subtasks   = SubtaskSerializer(many=True, read_only=True)

    class Meta:
        model  = Task
        fields = [
            'id', 'title', 'description', 'status', 'priority',
            'assignee', 'created_by', 'due_date', 'progress',
            'subtasks', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'progress', 'created_at', 'updated_at']


class CreateTaskSerializer(serializers.ModelSerializer):
    assignee_id = serializers.UUIDField(required=False, allow_null=True)

    class Meta:
        model  = Task
        fields = ['title', 'description', 'status', 'priority', 'assignee_id', 'due_date']


class ActivityFeedSerializer(serializers.ModelSerializer):
    actor = UserSerializer(read_only=True)

    class Meta:
        model  = ActivityFeed
        fields = ['id', 'actor', 'action', 'object_type', 'object_name', 'timestamp']

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    class Meta:
        model = Comment
        fields = ['id', 'author', 'content', 'created_at']
        read_only_fields = ['id', 'author', 'created_at']
