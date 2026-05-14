from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.workspaces.permissions import IsWorkspaceMember, IsWorkspaceAdmin
from .models import Project, Task, Subtask, Comment, Suggestion, Reaction
from .serializers import ProjectSerializer, TaskSerializer, SubtaskSerializer, CommentSerializer, SuggestionSerializer, ReactionSerializer

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsWorkspaceAdmin()]
        return [permissions.IsAuthenticated(), IsWorkspaceMember()]

    queryset = Project.objects.none()

    def get_queryset(self):
        user = self.request.user
        # Filter projects by workspace membership
        qs = Project.objects.filter(workspace__members=user).prefetch_related('tasks', 'members')
        
        workspace_id = self.request.query_params.get('workspace')
        if workspace_id:
            qs = qs.filter(workspace_id=workspace_id)
        
        return qs.distinct()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['get'])
    def progress(self, request, pk=None):
        project = self.get_object()
        serializer = self.get_serializer(project)
        return Response({'progress': serializer.data['progress']})

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated, IsWorkspaceMember]
    queryset = Task.objects.none()

    def get_queryset(self):
        qs = Task.objects.filter(project__workspace__members=self.request.user)\
            .select_related('project', 'assignee', 'created_by')\
            .prefetch_related('subtasks', 'comments', 'reactions', 'activities', 'files')
        
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        
        workspace_id = self.request.query_params.get('workspace')
        if workspace_id:
            qs = qs.filter(project__workspace_id=workspace_id)

        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def add_subtask(self, request, pk=None):
        task = self.get_object()
        serializer = SubtaskSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(task=task)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def add_comment(self, request, pk=None):
        task = self.get_object()
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(task=task, user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Comment.objects.none()

    def get_queryset(self):
        return Comment.objects.filter(task__project__workspace__members=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class SuggestionViewSet(viewsets.ModelViewSet):
    serializer_class = SuggestionSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Suggestion.objects.none()

    def get_queryset(self):
        return Suggestion.objects.filter(task__project__workspace__members=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ReactionViewSet(viewsets.ModelViewSet):
    serializer_class = ReactionSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Reaction.objects.none()

    def get_queryset(self):
        return Reaction.objects.filter(task__project__workspace__members=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
