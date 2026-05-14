from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import DirectMessage, FriendRequest, FileAttachment, Meeting, EmailLog, CallLog
from .serializers import (
    DirectMessageSerializer, FriendRequestSerializer, FileAttachmentSerializer,
    MeetingSerializer, EmailLogSerializer, CallLogSerializer
)
from django.db.models import Q

class DirectMessageViewSet(viewsets.ModelViewSet):
    serializer_class = DirectMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = DirectMessage.objects.none()

    def get_queryset(self):
        return DirectMessage.objects.filter(Q(sender=self.request.user) | Q(receiver=self.request.user))

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

class FriendRequestViewSet(viewsets.ModelViewSet):
    serializer_class = FriendRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = FriendRequest.objects.none()

    def get_queryset(self):
        return FriendRequest.objects.filter(Q(from_user=self.request.user) | Q(to_user=self.request.user))

    def perform_create(self, serializer):
        serializer.save(from_user=self.request.user)

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        friend_request = self.get_object()
        friend_request.status = 'accepted'
        friend_request.save()
        return Response({'status': 'accepted'})

class FileAttachmentViewSet(viewsets.ModelViewSet):
    serializer_class = FileAttachmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = FileAttachment.objects.none()

    def get_queryset(self):
        return FileAttachment.objects.filter(uploaded_by=self.request.user)

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

class MeetingViewSet(viewsets.ModelViewSet):
    serializer_class = MeetingSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Meeting.objects.all()

class EmailLogViewSet(viewsets.ModelViewSet):
    serializer_class = EmailLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = EmailLog.objects.all()

class CallLogViewSet(viewsets.ModelViewSet):
    serializer_class = CallLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = CallLog.objects.all()
