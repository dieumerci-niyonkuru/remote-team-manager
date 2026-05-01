from rest_framework import viewsets, permissions
from .models import ChatRoom, ChatMessage
from .serializers import ChatRoomSerializer, ChatMessageSerializer

class ChatRoomViewSet(viewsets.ModelViewSet):
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = ChatRoom.objects.none()

    def get_queryset(self):
        return ChatRoom.objects.filter(workspace__members=self.request.user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class ChatMessageViewSet(viewsets.ModelViewSet):
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = ChatMessage.objects.none()

    def get_queryset(self):
        return ChatMessage.objects.filter(room__workspace__members=self.request.user)
