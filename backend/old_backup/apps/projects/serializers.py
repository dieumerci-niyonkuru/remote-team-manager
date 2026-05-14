from rest_framework import serializers
from .models import Project
from apps.users.serializers import UserSerializer


class ProjectSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    task_count = serializers.SerializerMethodField()

    class Meta:
        model  = Project
        fields = [
            'id', 'name', 'description', 'status',
            'created_by', 'task_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def get_task_count(self, obj):
        return obj.tasks.count() if hasattr(obj, 'tasks') else 0


class CreateProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Project
        fields = ['name', 'description', 'status']
