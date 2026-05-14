from rest_framework import serializers
from .models import Project, Task, Subtask, Comment, Suggestion, Reaction, TaskActivity, TaskFile
from django.contrib.auth import get_user_model

User = get_user_model()

class ProjectSerializer(serializers.ModelSerializer):
    progress = serializers.SerializerMethodField()
    task_count = serializers.SerializerMethodField()
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = (
            'id', 'name', 'description', 'workspace', 'project_type', 
            'status', 'progress', 'task_count', 'member_count', 
            'created_at', 'updated_at'
        )

    def get_progress(self, obj):
        total_tasks = obj.tasks.count()
        if total_tasks == 0:
            return 0
        done_tasks = obj.tasks.filter(status='done').count()
        return int((done_tasks / total_tasks) * 100)

    def get_task_count(self, obj):
        return obj.tasks.count()

    def get_member_count(self, obj):
        return obj.members.count()

class SubtaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subtask
        fields = '__all__'

class CommentSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = Comment
        fields = '__all__'

class SuggestionSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = Suggestion
        fields = '__all__'

class ReactionSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = Reaction
        fields = '__all__'

class TaskActivitySerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.username')
    class Meta:
        model = TaskActivity
        fields = ('id', 'user_name', 'verb', 'created_at')

class TaskFileSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.ReadOnlyField(source='uploaded_by.username')
    class Meta:
        model = TaskFile
        fields = ('id', 'file', 'filename', 'uploaded_by_name', 'uploaded_at')

class TaskSerializer(serializers.ModelSerializer):
    subtasks = SubtaskSerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    reactions = ReactionSerializer(many=True, read_only=True)
    activities = TaskActivitySerializer(many=True, read_only=True)
    files = TaskFileSerializer(many=True, read_only=True)
    assignee_name = serializers.ReadOnlyField(source='assignee.username')

    class Meta:
        model = Task
        fields = (
            'id', 'title', 'description', 'project', 'assignee', 'assignee_name',
            'status', 'priority', 'due_date', 'estimated_minutes', 
            'subtasks', 'comments', 'reactions', 'activities', 'files',
            'created_at', 'updated_at'
        )
