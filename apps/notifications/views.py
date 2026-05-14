from .models import Notification, Invite
from .serializers import NotificationSerializer, InviteSerializer
from rest_framework import viewsets, permissions, mixins, status
from rest_framework.decorators import action
from rest_framework.response import Response

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

class InviteViewSet(viewsets.ModelViewSet):
    serializer_class = InviteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Invite.objects.filter(email=self.request.user.email) | Invite.objects.filter(invited_by=self.request.user)

    @action(detail=False, methods=['get'])
    def received(self, request):
        invites = Invite.objects.filter(email=request.user.email, accepted=False)
        serializer = self.get_serializer(invites, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def sent(self, request):
        workspace_id = request.query_params.get('workspace')
        invites = Invite.objects.filter(invited_by=request.user)
        if workspace_id:
            invites = invites.filter(workspace_id=workspace_id)
        serializer = self.get_serializer(invites, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        invite = self.get_object()
        if invite.email != request.user.email:
            return Response({'error': 'Not your invite'}, status=status.HTTP_403_FORBIDDEN)
        
        from apps.workspaces.models import WorkspaceMember
        WorkspaceMember.objects.get_or_create(
            workspace=invite.workspace,
            user=request.user,
            defaults={'role': invite.role}
        )
        invite.accepted = True
        invite.save()
        return Response({'status': 'accepted'})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        invite = self.get_object()
        if invite.email != request.user.email:
            return Response({'error': 'Not your invite'}, status=status.HTTP_403_FORBIDDEN)
        invite.delete()
        return Response({'status': 'rejected'})
