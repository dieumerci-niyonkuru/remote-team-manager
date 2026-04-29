from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Notification

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notification_list(request):
    notifications = Notification.objects.filter(recipient=request.user).order_by('-created_at')[:50]
    from .serializers import NotificationSerializer
    return Response({'data': NotificationSerializer(notifications, many=True).data, 'message': 'Success'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unread_count(request):
    count = Notification.objects.filter(recipient=request.user, read=False).count()
    return Response({'data': {'count': count}, 'message': 'Success'})

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def mark_read(request, pk):
    notification = Notification.objects.get(pk=pk, recipient=request.user)
    notification.read = True
    notification.save()
    return Response({'data': None, 'message': 'Marked as read'})
