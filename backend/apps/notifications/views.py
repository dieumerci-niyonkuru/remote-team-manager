from rest_framework import viewsets, permissions, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Notification, Invite
from .serializers import NotificationSerializer, InviteSerializer

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
