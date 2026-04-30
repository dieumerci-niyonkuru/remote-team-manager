from rest_framework import viewsets, permissions
from .models import Channel, Message, MessageReaction
from .serializers import ChannelSerializer, MessageSerializer, MessageReactionSerializer

class ChannelViewSet(viewsets.ModelViewSet):
    serializer_class = ChannelSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Channel.objects.filter(workspace__members=self.request.user)

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Message.objects.filter(channel__workspace__members=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class MessageReactionViewSet(viewsets.ModelViewSet):
    serializer_class = MessageReactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MessageReaction.objects.filter(message__channel__workspace__members=self.request.user)
