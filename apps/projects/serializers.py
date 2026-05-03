from rest_framework import serializers
from .models import Project, Task
from apps.accounts.serializers import UserSerializer

class TaskSerializer(serializers.ModelSerializer):
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
