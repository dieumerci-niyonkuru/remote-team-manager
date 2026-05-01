from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Workspace, WorkspaceMember
from .serializers import WorkspaceSerializer, WorkspaceMemberSerializer
from apps.accounts.serializers import UserSerializer
from django.conf import settings

class WorkspaceViewSet(viewsets.ModelViewSet):
    serializer_class = WorkspaceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.workspaces.all()

    def perform_create(self, serializer):
        workspace = serializer.save(created_by=self.request.user)
        WorkspaceMember.objects.create(workspace=workspace, user=self.request.user, role='owner')

    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        workspace = self.get_object()
        # Check if current user is owner or manager
        try:
            member = workspace.workspacemember_set.get(user=request.user)
            if member.role not in ['owner', 'manager']:
                return Response({'error': 'Not authorized'}, status=status.HTTP_403_FORBIDDEN)
        except:
            return Response({'error': 'Not a member'}, status=status.HTTP_403_FORBIDDEN)
        
        user_id = request.data.get('user_id')
        role = request.data.get('role', 'viewer')
        try:
            user = settings.AUTH_USER_MODEL.objects.get(id=user_id)
            WorkspaceMember.objects.get_or_create(workspace=workspace, user=user, defaults={'role': role})
            return Response({'status': 'member added'})
        except:
            return Response({'error': 'User not found'}, status=status.HTTP_400_BAD_REQUEST)

from apps.notifications.models import Invite
from rest_framework.decorators import action
from rest_framework.response import Response

    @action(detail=False, methods=['post'])
    def accept_invite(self, request):
        token = request.data.get('token')
        try:
            invite = Invite.objects.get(token=token, expires_at__gt=now(), accepted=False)
            workspace = invite.workspace
            workspace.members.add(request.user, through_defaults={'role': invite.role})
            invite.accepted = True
            invite.save()
            return Response({'message': f'Joined workspace {workspace.name}'})
        except Invite.DoesNotExist:
            return Response({'error': 'Invalid or expired invite'}, status=400)
