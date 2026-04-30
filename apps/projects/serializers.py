from rest_framework import serializers
from .models import Project, Task, Subtask, Comment, Reaction
from apps.accounts.serializers import UserSerializer

class SubtaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subtask
        fields = ('id', 'title', 'is_completed')

class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = Comment
        fields = ('id', 'user', 'content', 'created_at')

class ReactionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = Reaction
        fields = ('id', 'user', 'emoji')

class TaskSerializer(serializers.ModelSerializer):
    subtasks = SubtaskSerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    assignee = UserSerializer(read_only=True)
    class Meta:
        model = Task
        fields = ('id', 'title', 'description', 'project', 'assignee', 'status', 'priority', 'due_date', 'created_by', 'created_at', 'updated_at', 'subtasks', 'comments')
        read_only_fields = ('created_by',)

class ProjectSerializer(serializers.ModelSerializer):
    tasks = TaskSerializer(many=True, read_only=True)
    class Meta:
        model = Project
        fields = ('id', 'name', 'description', 'workspace', 'created_by', 'created_at', 'updated_at', 'tasks')
        read_only_fields = ('created_by',)
