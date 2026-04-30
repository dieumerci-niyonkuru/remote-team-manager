from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Workspace, WorkspaceMember
from .serializers import (
    WorkspaceSerializer, CreateWorkspaceSerializer,
    WorkspaceMemberSerializer, InviteMemberSerializer
)
from apps.users.models import User


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
def workspace_list(request):
    if request.method == 'GET':
        memberships = WorkspaceMember.objects.filter(
            user=request.user
        ).select_related('workspace')
        workspaces = [m.workspace for m in memberships]
        return success_response(
            data=WorkspaceSerializer(workspaces, many=True).data
        )

    serializer = CreateWorkspaceSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'data': None, 'message': serializer.errors}, status=400)

    workspace = serializer.save(owner=request.user)
    WorkspaceMember.objects.create(
        workspace=workspace,
        user=request.user,
        role=WorkspaceMember.Role.OWNER
    )
    return success_response(
        data=WorkspaceSerializer(workspace).data,
        message='Workspace created.',
        status_code=201
    )


@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def workspace_detail(request, pk):
    workspace = get_object_or_404(Workspace, pk=pk)
    role = get_user_role(workspace, request.user)

    if role is None:
        return error_response('You are not a member of this workspace.', 403)

    if request.method == 'GET':
        return success_response(data=WorkspaceSerializer(workspace).data)

    if request.method == 'PATCH':
        if role not in [WorkspaceMember.Role.OWNER, WorkspaceMember.Role.MANAGER]:
            return error_response('Only Owner or Manager can update workspace.', 403)
        serializer = CreateWorkspaceSerializer(
            workspace, data=request.data, partial=True
        )
        if not serializer.is_valid():
            return Response({'data': None, 'message': serializer.errors}, status=400)
        serializer.save()
        return success_response(
            data=WorkspaceSerializer(workspace).data,
            message='Workspace updated.'
        )

    if request.method == 'DELETE':
        if role != WorkspaceMember.Role.OWNER:
            return error_response('Only the Owner can delete workspace.', 403)
        workspace.delete()
        return success_response(message='Workspace deleted.')


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def workspace_members(request, pk):
    workspace = get_object_or_404(Workspace, pk=pk)
    role = get_user_role(workspace, request.user)

    if role is None:
        return error_response('You are not a member of this workspace.', 403)

    if request.method == 'GET':
        members = WorkspaceMember.objects.filter(
            workspace=workspace
        ).select_related('user')
        return success_response(
            data=WorkspaceMemberSerializer(members, many=True).data
        )

    if role != WorkspaceMember.Role.OWNER:
        return error_response('Only the Owner can invite members.', 403)

    serializer = InviteMemberSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'data': None, 'message': serializer.errors}, status=400)

    try:
        user = User.objects.get(email=serializer.validated_data['email'])
    except User.DoesNotExist:
        return error_response('No user found with this email.')

    if WorkspaceMember.objects.filter(workspace=workspace, user=user).exists():
        return error_response('User is already a member.')

    member = WorkspaceMember.objects.create(
        workspace=workspace,
        user=user,
        role=serializer.validated_data['role']
    )
    return success_response(
        data=WorkspaceMemberSerializer(member).data,
        message='Member invited.',
        status_code=201
    )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_member(request, pk, user_id):
    workspace = get_object_or_404(Workspace, pk=pk)
    role = get_user_role(workspace, request.user)

    if role != WorkspaceMember.Role.OWNER:
        return error_response('Only the Owner can remove members.', 403)

    member = get_object_or_404(
        WorkspaceMember, workspace=workspace, user__id=user_id
    )
    if member.user == workspace.owner:
        return error_response('Cannot remove the workspace owner.', 400)

    member.delete()
    return success_response(message='Member removed.')
