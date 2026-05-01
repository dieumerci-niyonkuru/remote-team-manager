from rest_framework import viewsets, permissions
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
        # Simple: users active in last 5 minutes
        from datetime import timedelta
        threshold = now() - timedelta(minutes=5)
        online_users = User.objects.filter(presence__last_activity__gte=threshold).values('id', 'username', 'first_name')
        return Response(list(online_users))

    @action(detail=False, methods=['post'])
    def heartbeat(self, request):
        presence, _ = Presence.objects.get_or_create(user=request.user)
        presence.last_activity = now()
        presence.status = 'online'
        presence.save()
        return Response({'status': 'online'})
