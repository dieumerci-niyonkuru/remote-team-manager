from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils.timezone import now
from .models import Presence
from .serializers import PresenceSerializer
from apps.accounts.models import User


class PresenceViewSet(viewsets.GenericViewSet):
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['get'])
    def online_users(self, request):
        from datetime import timedelta
        threshold = now() - timedelta(minutes=5)
        presences = Presence.objects.filter(
            last_activity__gte=threshold
        ).select_related('user').exclude(status='offline')
        data = [
            {
                'id': p.user.id,
                'username': p.user.username,
                'first_name': p.user.first_name,
                'last_name': p.user.last_name,
                'status': p.effective_status(),
                'custom_status': p.custom_status,
                'status_emoji': p.status_emoji,
            }
            for p in presences
        ]
        return Response({'data': data})

    @action(detail=False, methods=['post'])
    def heartbeat(self, request):
        presence, _ = Presence.objects.get_or_create(user=request.user)
        presence.last_activity = now()
        if presence.status == 'offline':
            presence.status = 'online'
        presence.save(update_fields=['last_activity', 'status'])
        return Response({'status': presence.effective_status()})

    @action(detail=False, methods=['post'])
    def set_status(self, request):
        new_status = request.data.get('status', 'online')
        custom_status = request.data.get('custom_status', '')
        status_emoji = request.data.get('status_emoji', '')
        valid_statuses = ['online', 'away', 'busy', 'dnd', 'offline']
        if new_status not in valid_statuses:
            return Response({'error': f'Invalid status. Choose from: {valid_statuses}'}, status=status.HTTP_400_BAD_REQUEST)
        presence, _ = Presence.objects.get_or_create(user=request.user)
        presence.status = new_status
        presence.custom_status = custom_status
        presence.status_emoji = status_emoji
        presence.last_activity = now()
        presence.save()
        return Response({'status': new_status, 'custom_status': custom_status, 'status_emoji': status_emoji})

    @action(detail=False, methods=['get'])
    def my_status(self, request):
        presence, _ = Presence.objects.get_or_create(user=request.user)
        return Response({
            'status': presence.effective_status(),
            'custom_status': presence.custom_status,
            'status_emoji': presence.status_emoji,
            'last_activity': presence.last_activity.isoformat(),
        })
