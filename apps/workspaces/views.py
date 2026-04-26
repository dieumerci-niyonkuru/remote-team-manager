from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Workspace, WorkspaceMember
from .serializers import WorkspaceSerializer, CreateWorkspaceSerializer, WorkspaceMemberSerializer, InviteMemberSerializer
from .permissions import IsWorkspaceMember, IsWorkspaceManager, IsWorkspaceOwner
from apps.users.models import User


def success_response(data=None, message='Success', status_code=200):
    return Response({'data': data, 'message': message}, status=status_code)


def error_response(message='Error', status_code=400):
    return Response({'data': None, 'message': message}, status=status_code)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def workspace_list(request):
    if request.method == 'GET':
        memberships = WorkspaceMember.objects.filter(user=request.user).select_related('workspace')
        workspaces  = [m.workspace for m in memberships]
        return success_response(data=WorkspaceSerializer(workspaces, many=True).data)

    serializer = CreateWorkspaceSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'data': None, 'message': serializer.errors}, status=400)

    workspace = serializer.save(owner=request.user)
    WorkspaceMember.objects.create(workspace=workspace, user=request.user, role=WorkspaceMember.Role.OWNER)
    return success_response(data=WorkspaceSerializer(workspace).data, message='Workspace created.', status_code=201)


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def workspace_detail(request, pk):
    workspace = get_object_or_404(Workspace, pk=pk)

    if not WorkspaceMember.objects.filter(workspace=workspace, user=request.user).exists():
        return error_response('You are not a member of this workspace.', 403)

    if request.method == 'GET':
        return success_response(data=WorkspaceSerializer(workspace).data)

    if request.method == 'PATCH':
        if workspace.owner != request.user:
            return error_response('Only the owner can update this workspace.', 403)
        serializer = CreateWorkspaceSerializer(workspace, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response({'data': None, 'message': serializer.errors}, status=400)
        serializer.save()
        return success_response(data=WorkspaceSerializer(workspace).data, message='Workspace updated.')

    if request.method == 'DELETE':
        if workspace.owner != request.user:
            return error_response('Only the owner can delete this workspace.', 403)
        workspace.delete()
        return success_response(message='Workspace deleted.')


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def workspace_members(request, pk):
    workspace = get_object_or_404(Workspace, pk=pk)

    if not WorkspaceMember.objects.filter(workspace=workspace, user=request.user).exists():
        return error_response('You are not a member of this workspace.', 403)

    if request.method == 'GET':
        members = WorkspaceMember.objects.filter(workspace=workspace).select_related('user')
        return success_response(data=WorkspaceMemberSerializer(members, many=True).data)

    if workspace.owner != request.user:
        return error_response('Only the owner can invite members.', 403)

    serializer = InviteMemberSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'data': None, 'message': serializer.errors}, status=400)

    try:
        user = User.objects.get(email=serializer.validated_data['email'])
    except User.DoesNotExist:
        return error_response('User with this email not found.')

    if WorkspaceMember.objects.filter(workspace=workspace, user=user).exists():
        return error_response('User is already a member.')

    member = WorkspaceMember.objects.create(
        workspace=workspace,
        user=user,
        role=serializer.validated_data['role']
    )
    return success_response(data=WorkspaceMemberSerializer(member).data, message='Member invited.', status_code=201)
