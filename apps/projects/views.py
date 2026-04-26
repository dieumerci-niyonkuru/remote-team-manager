from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from apps.workspaces.models import Workspace, WorkspaceMember
from .models import Project
from .serializers import ProjectSerializer, CreateProjectSerializer


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
def project_list(request, workspace_pk):
    workspace = get_object_or_404(Workspace, pk=workspace_pk)
    role = get_user_role(workspace, request.user)

    if role is None:
        return error_response('You are not a member of this workspace.', 403)

    if request.method == 'GET':
        projects = Project.objects.filter(workspace=workspace)
        return success_response(
            data=ProjectSerializer(projects, many=True).data
        )

    # Only Owner or Manager can create projects
    if role not in [WorkspaceMember.Role.OWNER, WorkspaceMember.Role.MANAGER]:
        return error_response('Only Owner or Manager can create projects.', 403)

    serializer = CreateProjectSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'data': None, 'message': serializer.errors}, status=400)

    project = serializer.save(workspace=workspace, created_by=request.user)
    return success_response(
        data=ProjectSerializer(project).data,
        message='Project created.',
        status_code=201
    )


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def project_detail(request, workspace_pk, pk):
    workspace = get_object_or_404(Workspace, pk=workspace_pk)
    role = get_user_role(workspace, request.user)

    if role is None:
        return error_response('You are not a member of this workspace.', 403)

    project = get_object_or_404(Project, pk=pk, workspace=workspace)

    if request.method == 'GET':
        return success_response(data=ProjectSerializer(project).data)

    if request.method == 'PATCH':
        if role not in [WorkspaceMember.Role.OWNER, WorkspaceMember.Role.MANAGER]:
            return error_response('Only Owner or Manager can update projects.', 403)
        serializer = CreateProjectSerializer(project, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response({'data': None, 'message': serializer.errors}, status=400)
        serializer.save()
        return success_response(
            data=ProjectSerializer(project).data,
            message='Project updated.'
        )

    if request.method == 'DELETE':
        if role != WorkspaceMember.Role.OWNER:
            return error_response('Only the Owner can delete projects.', 403)
        project.delete()
        return success_response(message='Project deleted.')
