from rest_framework import viewsets, permissions
from .models import Channel, Message, MessageReaction
from .serializers import ChannelSerializer, MessageSerializer, MessageReactionSerializer
from django.db.models import Q

class ChannelViewSet(viewsets.ModelViewSet):
    serializer_class = ChannelSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Show channels that are either public OR user is a member of private channel
        return Channel.objects.filter(
            Q(is_public=True) | Q(members=self.request.user)
        )

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only show messages from channels user can access
        return Message.objects.filter(channel__in=Channel.objects.filter(
            Q(is_public=True) | Q(members=self.request.user)
        ))

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        # Check for mentions and create notifications
        content = serializer.validated_data.get('content', '')
        import re
        from django.contrib.auth import get_user_model
        from apps.notifications.models import Notification
        User = get_user_model()
        mentions = re.findall(r'@(\w+)', content)
        for username in mentions:
            try:
                user = User.objects.get(username=username)
                if user != self.request.user:
                    Notification.objects.create(
                        recipient=user,
                        actor=self.request.user,
                        verb=f'mentioned you in channel {serializer.validated_data["channel"].name}',
                        target=serializer.validated_data["channel"]
                    )
            except User.DoesNotExist:
                pass

class MessageReactionViewSet(viewsets.ModelViewSet):
    serializer_class = MessageReactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return MessageReaction.objects.filter(message__channel__in=Channel.objects.filter(
            Q(is_public=True) | Q(members=self.request.user)
        ))

    def perform_create(self, serializer):
        # Remove existing reaction from same user on same message if any
        MessageReaction.objects.filter(
            message=serializer.validated_data['message'],
            user=self.request.user
        ).delete()
        serializer.save(user=self.request.user)
