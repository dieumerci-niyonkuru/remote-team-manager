from rest_framework import viewsets, permissions, mixins
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer

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
