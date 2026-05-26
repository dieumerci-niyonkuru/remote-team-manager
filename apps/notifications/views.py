import secrets
from datetime import timedelta
from django.utils import timezone
from .models import Notification, Invite
from .serializers import NotificationSerializer, InviteSerializer
from rest_framework import viewsets, permissions, mixins, status
from rest_framework.decorators import action
from rest_framework.response import Response


class NotificationViewSet(viewsets.GenericViewSet,
                          mixins.ListModelMixin,
                          mixins.RetrieveModelMixin,
                          mixins.DestroyModelMixin):
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
        return Response({'data': {'id': notif.id}, 'message': 'Notification marked as read'})


class InviteViewSet(viewsets.ModelViewSet):
    serializer_class = InviteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Invite.objects.filter(email=self.request.user.email) | Invite.objects.filter(invited_by=self.request.user)

    @action(detail=False, methods=['get'])
    def received(self, request):
        invites = Invite.objects.filter(email=request.user.email, accepted=False)
        serializer = self.get_serializer(invites, many=True)
        return Response({'data': serializer.data, 'message': 'Received invitations retrieved successfully'})

    @action(detail=False, methods=['get'])
    def sent(self, request):
        workspace_id = request.query_params.get('workspace')
        invites = Invite.objects.filter(invited_by=request.user)
        if workspace_id:
            invites = invites.filter(workspace_id=workspace_id)
        serializer = self.get_serializer(invites, many=True)
        return Response({'data': serializer.data, 'message': 'Sent invitations retrieved successfully'})

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        invite = self.get_object()
        if invite.email and invite.email != request.user.email:
            return Response({'error': 'Not your invite'}, status=status.HTTP_403_FORBIDDEN)

        if invite.expires_at < timezone.now():
            return Response({'error': 'This invite has expired.'}, status=status.HTTP_400_BAD_REQUEST)

        from apps.workspaces.models import WorkspaceMember
        WorkspaceMember.objects.get_or_create(
            workspace=invite.workspace,
            user=request.user,
            defaults={'role': invite.role}
        )
        invite.accepted = True
        invite.save()
        return Response({
            'data': {
                'workspace_id': invite.workspace.id,
                'workspace_name': invite.workspace.name,
            },
            'status': 'accepted',
        })

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        invite = self.get_object()
        if invite.email and invite.email != request.user.email:
            return Response({'error': 'Not your invite'}, status=status.HTTP_403_FORBIDDEN)
        invite.delete()
        return Response({'status': 'rejected'})

    @action(detail=False, methods=['post'])
    def generate_link(self, request):
        """Create a shareable invite link for a workspace. Returns join URL with token."""
        workspace_id = request.data.get('workspace')
        email = request.data.get('email', '')
        role = request.data.get('role', 'viewer')
        expires_days = max(1, min(int(request.data.get('expires_days', 7)), 30))

        if not workspace_id:
            return Response({'error': 'workspace is required.'}, status=status.HTTP_400_BAD_REQUEST)

        from apps.workspaces.models import Workspace
        try:
            workspace = Workspace.objects.get(id=workspace_id)
        except Workspace.DoesNotExist:
            return Response({'error': 'Workspace not found.'}, status=status.HTTP_404_NOT_FOUND)

        token = secrets.token_urlsafe(32)
        invite = Invite.objects.create(
            workspace=workspace,
            email=email,
            invited_by=request.user,
            role=role,
            token=token,
            expires_at=timezone.now() + timedelta(days=expires_days),
        )

        # The frontend URL — use the Origin header if present, else build from request
        origin = request.headers.get('Origin') or request.build_absolute_uri('/').rstrip('/')
        join_url = f'{origin}/join/{token}'

        serializer = self.get_serializer(invite)
        return Response({
            'data': {
                **serializer.data,
                'join_url': join_url,
            },
            'message': f'Invite link created. Valid for {expires_days} days.',
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def join_by_token(self, request):
        """Accept a workspace invite by token (for shareable links)."""
        token = request.data.get('token', '').strip()
        if not token:
            return Response({'error': 'token is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            invite = Invite.objects.select_related('workspace').get(token=token, accepted=False)
        except Invite.DoesNotExist:
            return Response({'error': 'Invalid or already-used invite token.'}, status=status.HTTP_404_NOT_FOUND)

        if invite.expires_at < timezone.now():
            return Response({'error': 'This invite link has expired.'}, status=status.HTTP_400_BAD_REQUEST)

        from apps.workspaces.models import WorkspaceMember
        _, created = WorkspaceMember.objects.get_or_create(
            workspace=invite.workspace,
            user=request.user,
            defaults={'role': invite.role}
        )
        invite.accepted = True
        invite.save()

        return Response({
            'data': {
                'workspace_id': invite.workspace.id,
                'workspace_name': invite.workspace.name,
                'role': invite.role,
                'already_member': not created,
            },
            'message': f'Successfully joined {invite.workspace.name}!',
        })
