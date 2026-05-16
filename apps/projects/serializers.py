from rest_framework import serializers
from apps.accounts.serializers import UserSerializer
from .models import Project, Task, Subtask, Comment, Suggestion, Reaction, TaskFile, TaskActivity

class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = '__all__'
        read_only_fields = ('created_by',)

class TaskFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskFile
        fields = '__all__'

class TaskActivitySerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.full_name')
    class Meta:
        model = TaskActivity
        fields = '__all__'

class SubtaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subtask
        fields = '__all__'
        read_only_fields = ('task',)

class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = Comment
        fields = '__all__'
        read_only_fields = ('task', 'user')

class SuggestionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = Suggestion
        fields = '__all__'
        read_only_fields = ('task', 'user')

class ReactionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = Reaction
        fields = ('id', 'user', 'emoji', 'created_at', 'task')
        read_only_fields = ('task', 'user')

class TaskSerializer(serializers.ModelSerializer):
    assignee_name = serializers.ReadOnlyField(source='assignee.full_name')
    activities = TaskActivitySerializer(many=True, read_only=True)
    subtasks = SubtaskSerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    files = TaskFileSerializer(many=True, read_only=True)
    progress = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ('created_by',)

    def get_progress(self, obj):
        total = obj.subtasks.count()
        if total == 0: return 0
        done = obj.subtasks.filter(is_completed=True).count()
        return int((done / total) * 100)
