from rest_framework import viewsets, permissions, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Notification, Invite
from .serializers import NotificationSerializer, InviteSerializer

from django.utils.crypto import get_random_string
from django.utils.timezone import now
from datetime import timedelta
from django.conf import settings

class InvitationViewSet(viewsets.ModelViewSet):
    serializer_class = InviteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users see invites sent TO them
        return Invite.objects.filter(email=self.request.user.email)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        invite = self.get_object()
        if invite.accepted:
            return Response({'error': 'Already accepted'}, status=400)
        
        # Join Workspace
        from apps.workspaces.models import WorkspaceMember
        WorkspaceMember.objects.get_or_create(
            workspace=invite.workspace, 
            user=request.user, 
            defaults={'role': invite.role}
        )
        
        # Join Project (Auto-attach)
        if invite.project:
            invite.project.members.add(request.user)
            
        invite.accepted = True
        invite.save()
        return Response({'status': 'joined', 'workspace_id': invite.workspace.id})

    @action(detail=False, methods=['post'])
    def share_link(self, request):
        workspace_id = request.data.get('workspace_id')
        role = request.data.get('role', 'member')
        invite = Invite.objects.create(
            workspace_id=workspace_id,
            email='link-invite@placeholder.com',
            invited_by=request.user,
            role=role,
            token=get_random_string(64),
            expires_at=now() + timedelta(days=7)
        )
        # Using a fallback if settings.FRONTEND_URL is not set
        base_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        link = f"{base_url}/invites/accept/{invite.token}"
        return Response({'link': link})

class NotificationViewSet(viewsets.GenericViewSet,
                          mixins.ListModelMixin,
                          mixins.RetrieveModelMixin):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.request.user.notifications.all()

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        request.user.notifications.update(unread=False)
        return Response({'status': 'ok'})

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notif = self.get_object()
        notif.unread = False
        notif.save()
        return Response({'status': 'ok'})
