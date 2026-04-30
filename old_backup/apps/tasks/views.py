from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from apps.workspaces.models import Workspace, WorkspaceMember
from apps.projects.models import Project
from apps.users.models import User
from .models import Task, Subtask, TimeLog, ActivityFeed, Comment
from .serializers import (
    TaskSerializer, CreateTaskSerializer,
    SubtaskSerializer, TimeLogSerializer, ActivityFeedSerializer, CommentSerializer
)
from .filters import TaskFilter

def success_response(data=None, message='Success', status_code=200):
    return Response({'data': data, 'message': message}, status=status_code)

def error_response(message='Error', status_code=400):
    return Response({'data': None, 'message': message}, status=status_code)

def get_user_role(workspace, user):
    try:
        return WorkspaceMember.objects.get(workspace=workspace, user=user).role
    except WorkspaceMember.DoesNotExist:
        return None

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def task_list(request, workspace_pk, project_pk):
    workspace = get_object_or_404(Workspace, pk=workspace_pk)
    project = get_object_or_404(Project, pk=project_pk, workspace=workspace)
    role = get_user_role(workspace, request.user)

    if role is None:
        return error_response('Not a member of this workspace.', 403)

    if request.method == 'GET':
        tasks = Task.objects.filter(project=project)
        filterset = TaskFilter(request.GET, queryset=tasks)
        return success_response(data=TaskSerializer(filterset.qs, many=True).data)

    if role == WorkspaceMember.Role.VIEWER:
        return error_response('Viewers cannot create tasks.', 403)

    serializer = CreateTaskSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'data': None, 'message': serializer.errors}, status=400)

    assignee_id = serializer.validated_data.pop('assignee_id', None)
    assignee = None
    if assignee_id:
        try:
            assignee = User.objects.get(id=assignee_id)
        except User.DoesNotExist:
            return error_response('Assignee not found.')

    task = Task.objects.create(
        project=project,
        created_by=request.user,
        assignee=assignee,
        **serializer.validated_data
    )
    return success_response(data=TaskSerializer(task).data, message='Task created.', status_code=201)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def task_detail(request, workspace_pk, project_pk, pk):
    workspace = get_object_or_404(Workspace, pk=workspace_pk)
    project = get_object_or_404(Project, pk=project_pk, workspace=workspace)
    task = get_object_or_404(Task, pk=pk, project=project)
    role = get_user_role(workspace, request.user)

    if role is None:
        return error_response('Not a member of this workspace.', 403)

    if request.method == 'GET':
        return success_response(data=TaskSerializer(task).data)

    if request.method == 'PATCH':
        if role == WorkspaceMember.Role.VIEWER:
            return error_response('Viewers cannot update tasks.', 403)
        serializer = CreateTaskSerializer(task, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response({'data': None, 'message': serializer.errors}, status=400)
        assignee_id = serializer.validated_data.pop('assignee_id', None)
        if assignee_id:
            try:
                task.assignee = User.objects.get(id=assignee_id)
            except User.DoesNotExist:
                return error_response('Assignee not found.')
        serializer.save()
        return success_response(data=TaskSerializer(task).data, message='Task updated.')

    if request.method == 'DELETE':
        if role not in [WorkspaceMember.Role.OWNER, WorkspaceMember.Role.MANAGER]:
            return error_response('Only Owner or Manager can delete tasks.', 403)
        task.delete()
        return success_response(message='Task deleted.')


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def subtask_list(request, workspace_pk, project_pk, task_pk):
    workspace = get_object_or_404(Workspace, pk=workspace_pk)
    project = get_object_or_404(Project, pk=project_pk, workspace=workspace)
    task = get_object_or_404(Task, pk=task_pk, project=project)
    role = get_user_role(workspace, request.user)

    if role is None:
        return error_response('Not a member of this workspace.', 403)

    if request.method == 'GET':
        return success_response(data=SubtaskSerializer(task.subtasks.all(), many=True).data)

    if role == WorkspaceMember.Role.VIEWER:
        return error_response('Viewers cannot create subtasks.', 403)

    serializer = SubtaskSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'data': None, 'message': serializer.errors}, status=400)

    subtask = serializer.save(task=task)
    return success_response(data=SubtaskSerializer(subtask).data, message='Subtask created.', status_code=201)


@api_view(['PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def subtask_detail(request, workspace_pk, project_pk, task_pk, pk):
    workspace = get_object_or_404(Workspace, pk=workspace_pk)
    project = get_object_or_404(Project, pk=project_pk, workspace=workspace)
    task = get_object_or_404(Task, pk=task_pk, project=project)
    subtask = get_object_or_404(Subtask, pk=pk, task=task)
    role = get_user_role(workspace, request.user)

    if role is None:
        return error_response('Not a member of this workspace.', 403)

    if request.method == 'PATCH':
        serializer = SubtaskSerializer(subtask, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response({'data': None, 'message': serializer.errors}, status=400)
        serializer.save()
        task.update_progress()
        return success_response(data=SubtaskSerializer(subtask).data, message='Subtask updated.')

    subtask.delete()
    task.update_progress()
    return success_response(message='Subtask deleted.')


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def timelog_list(request, workspace_pk, project_pk, task_pk):
    workspace = get_object_or_404(Workspace, pk=workspace_pk)
    project = get_object_or_404(Project, pk=project_pk, workspace=workspace)
    task = get_object_or_404(Task, pk=task_pk, project=project)
    role = get_user_role(workspace, request.user)

    if role is None:
        return error_response('Not a member of this workspace.', 403)

    if request.method == 'GET':
        if role in [WorkspaceMember.Role.OWNER, WorkspaceMember.Role.MANAGER]:
            logs = task.timelogs.all()
        else:
            logs = task.timelogs.filter(user=request.user)
        return success_response(data=TimeLogSerializer(logs, many=True).data)

    serializer = TimeLogSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'data': None, 'message': serializer.errors}, status=400)

    log = serializer.save(task=task, user=request.user)
    return success_response(data=TimeLogSerializer(log).data, message='Time logged.', status_code=201)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def activity_feed(request, workspace_pk):
    workspace = get_object_or_404(Workspace, pk=workspace_pk)
    role = get_user_role(workspace, request.user)
    if role is None:
        return error_response('Not a member of this workspace.', 403)
    activities = ActivityFeed.objects.filter(workspace=workspace)[:50]
    return success_response(data=ActivityFeedSerializer(activities, many=True).data)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def comment_list(request, workspace_pk, project_pk, task_pk):
    workspace = get_object_or_404(Workspace, pk=workspace_pk)
    project = get_object_or_404(Project, pk=project_pk, workspace=workspace)
    task = get_object_or_404(Task, pk=task_pk, project=project)
    role = get_user_role(workspace, request.user)
    if role is None:
        return error_response('Not a member of this workspace.', 403)

    if request.method == 'GET':
        comments = task.comments.all()
        return success_response(data=CommentSerializer(comments, many=True).data)

    serializer = CommentSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'data': None, 'message': serializer.errors}, status=400)

    comment = serializer.save(task=task, author=request.user)
    return success_response(data=CommentSerializer(comment).data, message='Comment added.', status_code=201)
