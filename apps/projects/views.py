from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Project, Task
from .serializers import ProjectSerializer, TaskSerializer

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Project.objects.none()

    def get_queryset(self):
        return Project.objects.filter(workspace__members=self.request.user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Task.objects.none()

    def get_queryset(self):
        return Task.objects.filter(project__workspace__members=self.request.user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
