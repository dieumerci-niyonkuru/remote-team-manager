from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils.timezone import now
from django.db import models as django_models

from .models import WorkspaceMember
from .serializers import WorkspaceSerializer, WorkspaceMemberSerializer, ActivityFeedSerializer
from .permissions import IsWorkspaceMember, HasWorkspaceRole
from apps.notifications.models import Invite
from django.conf import settings
import uuid
from datetime import timedelta

class WorkspaceViewSet(viewsets.ModelViewSet):
    serializer_class = WorkspaceSerializer

    def get_permissions(self):
        if self.action == 'destroy':
            return [permissions.IsAuthenticated(), HasWorkspaceRole(['owner'])]
        if self.action in ['update', 'partial_update']:
            return [permissions.IsAuthenticated(), HasWorkspaceRole(['owner', 'manager'])]
        if getattr(self, 'action', None) in ['members', 'add_member', 'invite', 'remove_member'] and self.request.method in ['POST', 'DELETE']:
            return [permissions.IsAuthenticated(), HasWorkspaceRole(['owner', 'manager'])]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        return self.request.user.workspaces.all()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({
            'data': serializer.data,
            'message': 'Workspace created successfully.'
        }, status=status.HTTP_201_CREATED)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            'data': serializer.data,
            'message': 'Workspaces retrieved successfully.'
        })

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            'data': serializer.data,
            'message': 'Workspace retrieved successfully.'
        })

    def perform_create(self, serializer):
        workspace = serializer.save(created_by=self.request.user)
        WorkspaceMember.objects.create(workspace=workspace, user=self.request.user, role='owner')

    @action(detail=True, methods=['get'])
    def activity(self, request, pk=None):
        workspace = self.get_object()
        activities = workspace.activity.all()
        serializer = ActivityFeedSerializer(activities, many=True)
        return Response({'data': serializer.data})

    @action(detail=True, methods=['get', 'post'])
    def members(self, request, pk=None):
        workspace = self.get_object()
        if request.method == 'GET':
            members = workspace.workspacemember_set.all()
            serializer = WorkspaceMemberSerializer(members, many=True)
            return Response({'data': serializer.data})
        
        # Logic for POST (adding/inviting member)
        email = request.data.get('email')
        role = request.data.get('role', 'viewer')
        try:
            from apps.accounts.models import User
            user = User.objects.get(email=email)
            member, created = WorkspaceMember.objects.get_or_create(workspace=workspace, user=user, defaults={'role': role})
            if not created:
                return Response({'error': 'User is already a member.'}, status=status.HTTP_400_BAD_REQUEST)
            return Response({'data': {'email': email, 'role': role}, 'message': 'Member added successfully.'}, status=status.HTTP_201_CREATED)
        except User.DoesNotExist:
            return Response({'error': 'User not found. Please invite them instead.'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        # Permission: workspace owner or manager only (checked via workspace membership)
        workspace = self.get_object()
        try:
            requester_membership = workspace.workspacemember_set.get(user=request.user)
            if requester_membership.role not in ('owner', 'manager'):
                return Response({'error': 'Only workspace owners or managers can add members.'}, status=status.HTTP_403_FORBIDDEN)
        except WorkspaceMember.DoesNotExist:
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        return self.members(request, pk)

    @action(detail=True, methods=['post'])
    def invite(self, request, pk=None):
        workspace = self.get_object()
        # Check that requester is owner or manager
        try:
            requester_membership = workspace.workspacemember_set.get(user=request.user)
            if requester_membership.role not in ('owner', 'manager'):
                return Response({'error': 'Only workspace owners or managers can invite members.'}, status=status.HTTP_403_FORBIDDEN)
        except WorkspaceMember.DoesNotExist:
            return Response({'error': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        email = request.data.get('email', '').strip()
        # Normalize role — map UI-friendly values to valid WorkspaceMember roles
        raw_role = request.data.get('role', 'viewer')
        role_map = {'member': 'developer', 'admin': 'manager', 'owner': 'owner',
                    'manager': 'manager', 'developer': 'developer', 'viewer': 'viewer'}
        role = role_map.get(raw_role, 'viewer')

        token = uuid.uuid4().hex
        expire_days = 7
        expires_at = now() + timedelta(days=expire_days)
        invite = Invite.objects.create(
            workspace=workspace,
            email=email,
            invited_by=request.user,
            role=role,
            token=token,
            expires_at=expires_at
        )
        origin = request.headers.get('Origin') or request.build_absolute_uri('/').rstrip('/')
        join_url = f'{origin}/join/{token}'

        if email:
            try:
                from apps.notifications.tasks import send_invite_email
                send_invite_email.delay(invite.id, join_url)
            except Exception:
                pass

        return Response({
            'data': {'accept_url': join_url, 'join_url': join_url, 'token': token},
            'message': f'Invite created for {email or "shareable link"}'
        })

    @action(detail=False, methods=['post'])
    def accept_invite(self, request):
        token = request.data.get('token')
        try:
            invite = Invite.objects.get(token=token, expires_at__gt=now(), accepted=False)
            workspace = invite.workspace
            workspace.members.add(request.user, through_defaults={'role': invite.role})
            invite.accepted = True
            invite.save()
            return Response({'data': {'workspace_id': workspace.id}, 'message': f'Joined workspace {workspace.name}'})
        except Invite.DoesNotExist:
            return Response({'error': 'Invalid or expired invite'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['delete'], url_path='members/(?P<user_id>[^/.]+)')
    def remove_member(self, request, pk=None, user_id=None):
        workspace = self.get_object()
        # Check that the requesting user is a workspace owner (by membership role, not global role)
        try:
            requester_membership = workspace.workspacemember_set.get(user=request.user)
        except WorkspaceMember.DoesNotExist:
            return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        if requester_membership.role not in ('owner', 'admin', 'super_admin', 'workspace_owner'):
            return Response({'detail': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        try:
            member = workspace.workspacemember_set.get(user_id=user_id)
            if member.role == 'owner':
                return Response({'error': 'Cannot remove owner.'}, status=status.HTTP_400_BAD_REQUEST)
            member.delete()
            return Response({'message': 'Member removed successfully.'}, status=status.HTTP_200_OK)
        except WorkspaceMember.DoesNotExist:
            return Response({'error': 'Member not found.'}, status=status.HTTP_404_NOT_FOUND)


# ─── Global Search ──────────────────────────────────────────────────────────

from rest_framework.views import APIView

class GlobalSearchView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        q = request.query_params.get('q', '').strip()
        if not q:
            return Response({'data': {'tasks': [], 'projects': [], 'members': []}})

        from apps.projects.models import Task, Project
        from apps.accounts.models import User
        from apps.projects.serializers import TaskSerializer, ProjectSerializer
        from apps.accounts.serializers import UserSerializer

        user_workspaces = request.user.workspaces.all()

        tasks = Task.objects.filter(
            project__workspace__in=user_workspaces
        ).filter(
            django_models.Q(title__icontains=q) | django_models.Q(description__icontains=q)
        )[:10]

        projects = Project.objects.filter(
            workspace__in=user_workspaces
        ).filter(
            django_models.Q(name__icontains=q) | django_models.Q(description__icontains=q)
        )[:10]

        members = User.objects.filter(
            workspacemember__workspace__in=user_workspaces
        ).filter(
            django_models.Q(username__icontains=q) | django_models.Q(first_name__icontains=q) | django_models.Q(email__icontains=q)
        ).distinct()[:10]

        return Response({
            'data': {
                'tasks': TaskSerializer(tasks, many=True, context={'request': request}).data,
                'projects': ProjectSerializer(projects, many=True, context={'request': request}).data,
                'members': [{'id': m.id, 'username': m.username, 'email': m.email} for m in members],
            }
        })
