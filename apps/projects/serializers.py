from rest_framework import serializers
from .models import Project, Task, Subtask, Comment, Suggestion, Reaction
from apps.accounts.serializers import UserSerializer

class SubtaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subtask
        fields = '__all__'

class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = Comment
        fields = '__all__'
        read_only_fields = ('user',)

class SuggestionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = Suggestion
        fields = '__all__'
        read_only_fields = ('user',)

class ReactionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = Reaction
        fields = '__all__'
        read_only_fields = ('user',)

class TaskSerializer(serializers.ModelSerializer):
    subtasks = SubtaskSerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    suggestions = SuggestionSerializer(many=True, read_only=True)
    reactions = ReactionSerializer(many=True, read_only=True)
    assignee = UserSerializer(read_only=True)
    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ('created_by',)

class ProjectSerializer(serializers.ModelSerializer):
    tasks = TaskSerializer(many=True, read_only=True)
    class Meta:
        model = Project
        fields = '__all__'
        read_only_fields = ('created_by',)
