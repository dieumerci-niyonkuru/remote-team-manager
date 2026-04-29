from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_list(request):
    notifs = Notification.objects.filter(recipient=request.user).order_by('-created_at')[:50]
    return Response({'data': NotificationSerializer(notifs, many=True).data, 'message': 'Success'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unread_count(request):
    count = Notification.objects.filter(recipient=request.user, read=False).count()
    return Response({'data': {'count': count}, 'message': 'Success'})

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def mark_read(request, pk):
    notif = Notification.objects.get(pk=pk, recipient=request.user)
    notif.read = True
    notif.save()
    return Response({'data': None, 'message': 'Marked read'})
