from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from apps.workspaces.permissions import IsWorkspaceMember, IsWorkspaceAdmin, IsWorkspaceDeveloperOrAdmin
from .models import Project, Task, Subtask, Comment, Suggestion, Reaction
from .serializers import ProjectSerializer, TaskSerializer, SubtaskSerializer, CommentSerializer, SuggestionSerializer, ReactionSerializer
from apps.timetracking.models import TimeLog
from apps.timetracking.serializers import TimeLogSerializer

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsWorkspaceAdmin()]
        return [permissions.IsAuthenticated(), IsWorkspaceMember()]

    queryset = Project.objects.none()

    def get_queryset(self):
        user = self.request.user
        qs = Project.objects.filter(workspace__members=user).prefetch_related('tasks', 'members')
        workspace_id = self.request.query_params.get('workspace')
        if workspace_id:
            qs = qs.filter(workspace_id=workspace_id)
        return qs.distinct()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({
            'data': serializer.data,
            'message': 'Project created successfully.'
        }, status=status.HTTP_201_CREATED)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'data': serializer.data,
            'message': 'Projects retrieved successfully.'
        })

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            'data': serializer.data,
            'message': 'Project retrieved successfully.'
        })

    def perform_create(self, serializer):
        project = serializer.save(created_by=self.request.user)
        try:
            from apps.workspaces.models import ActivityFeed
            ActivityFeed.objects.create(
                workspace=project.workspace,
                actor=self.request.user,
                action='created',
                object_type='project',
                object_id=project.id,
                object_name=project.name
            )
        except Exception:
            pass

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    
    def get_permissions(self):
        if self.action == 'destroy':
            return [permissions.IsAuthenticated(), IsWorkspaceAdmin()]
        if self.action in ['create', 'update', 'partial_update']:
            return [permissions.IsAuthenticated(), IsWorkspaceDeveloperOrAdmin()]
        if getattr(self, 'action', None) in ['subtasks', 'add_subtask', 'timelogs'] and self.request.method == 'POST':
            return [permissions.IsAuthenticated(), IsWorkspaceDeveloperOrAdmin()]
        return [permissions.IsAuthenticated(), IsWorkspaceMember()]
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

        # Filters
        status = self.request.query_params.get('status')
        if status:
            qs = qs.filter(status=status)
        
        priority = self.request.query_params.get('priority')
        if priority:
            qs = qs.filter(priority=priority)
            
        assignee = self.request.query_params.get('assignee')
        if assignee:
            qs = qs.filter(assignee_id=assignee)

        due_date = self.request.query_params.get('due_date')
        if due_date:
            qs = qs.filter(due_date__date=due_date)

        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({
            'data': serializer.data,
            'message': 'Task created successfully.'
        }, status=status.HTTP_201_CREATED)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'data': serializer.data,
            'message': 'Tasks retrieved successfully.'
        })

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            'data': serializer.data,
            'message': 'Task retrieved successfully.'
        })

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        workspace_id = instance.project.workspace.id
        task_id = instance.id
        instance.delete()
        self._broadcast_delete(workspace_id, task_id)
        return Response({'message': 'Task deleted successfully.'}, status=status.HTTP_200_OK)

    def perform_create(self, serializer):
        task = serializer.save(created_by=self.request.user)
        self._log_activity(task, 'created')
        self._broadcast(task, 'created')

    def perform_update(self, serializer):
        task = serializer.save()
        self._log_activity(task, 'updated')
        self._broadcast(task, 'updated')

    def _log_activity(self, task, action):
        try:
            from apps.workspaces.models import ActivityFeed
            ActivityFeed.objects.create(
                workspace=task.project.workspace,
                actor=self.request.user,
                action=action,
                object_type='task',
                object_id=task.id,
                object_name=task.title
            )
        except Exception: pass

    def _broadcast(self, task, action):
        try:
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f'tasks_{task.project.workspace.id}',
                {
                    'type': 'task_update',
                    'action': action,
                    'task': TaskSerializer(task).data
                }
            )
        except Exception: pass

    def _broadcast_delete(self, workspace_id, task_id):
        try:
            from channels.layers import get_channel_layer
            from asgiref.sync import async_to_sync
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f'tasks_{workspace_id}',
                {
                    'type': 'task_update',
                    'action': 'deleted',
                    'task_id': task_id
                }
            )
        except Exception: pass

    @action(detail=True, methods=['get', 'post'])
    def subtasks(self, request, pk=None):
        task = self.get_object()
        if request.method == 'GET':
            serializer = SubtaskSerializer(task.subtasks.all(), many=True)
            return Response({'data': serializer.data})
        
        serializer = SubtaskSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(task=task)
            return Response({'data': serializer.data, 'message': 'Subtask added successfully.'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def add_subtask(self, request, pk=None):
        return self.subtasks(request, pk)

    @action(detail=True, methods=['get', 'post'])
    def timelogs(self, request, pk=None):
        task = self.get_object()
        if request.method == 'GET':
            qs = task.time_logs.all()
            member = task.project.workspace.workspacemember_set.filter(user=request.user).first()
            if member and member.role not in ['owner', 'manager']:
                qs = qs.filter(user=request.user)
            serializer = TimeLogSerializer(qs, many=True)
            return Response({'data': serializer.data})
        
        serializer = TimeLogSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(task=task, user=request.user)
            return Response({'data': serializer.data, 'message': 'Time logged successfully.'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class SubtaskViewSet(viewsets.ModelViewSet):
    serializer_class = SubtaskSerializer
    
    def get_permissions(self):
        if self.action == 'destroy':
            return [permissions.IsAuthenticated(), IsWorkspaceAdmin()]
        if self.action in ['create', 'update', 'partial_update']:
            return [permissions.IsAuthenticated(), IsWorkspaceDeveloperOrAdmin()]
        return [permissions.IsAuthenticated(), IsWorkspaceMember()]
    queryset = Subtask.objects.none()

    def get_queryset(self):
        return Subtask.objects.filter(task__project__workspace__members=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'data': serializer.data}, status=status.HTTP_201_CREATED)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({'data': serializer.data})

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({'data': serializer.data})

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        # Ensure task progress is updated if needed
        instance.task.refresh_from_db() 
        return Response({'data': serializer.data})

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
