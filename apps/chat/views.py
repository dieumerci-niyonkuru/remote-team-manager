from rest_framework import generics, viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import ChatRoom, Message
from .serializers import ChatRoomSerializer, MessageSerializer
from apps.accounts.models import User


class ChannelViewSet(viewsets.ModelViewSet):
    """
    Channels = group/workspace ChatRooms.
    Frontend calls /api/channels/ for public channels.
    """
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        workspace_id = self.request.query_params.get('workspace')
        qs = ChatRoom.objects.filter(
            room_type__in=['group', 'workspace'],
            participants=user
        )
        if workspace_id:
            qs = qs.filter(workspace_id=workspace_id)
        return qs.distinct()

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        data['room_type'] = data.get('room_type', 'group')
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        room = serializer.save()
        room.participants.add(request.user)
        return Response({'data': serializer.data, 'message': 'Channel created.'}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        room = self.get_object()
        room.participants.add(request.user)
        return Response({'message': 'Joined channel.'})

    @action(detail=True, methods=['post'])
    def read(self, request, pk=None):
        Message.objects.filter(room_id=pk, is_read=False).exclude(sender=request.user).update(is_read=True)
        return Response({'message': 'Marked as read.'})


class DirectMessageViewSet(viewsets.ModelViewSet):
    """
    DMs = private ChatRooms between 2 users.
    Frontend calls /api/direct-messages/.
    """
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ChatRoom.objects.filter(
            room_type='private',
            participants=self.request.user
        ).distinct()

    def create(self, request, *args, **kwargs):
        other_user_id = request.data.get('user_id') or request.data.get('recipient')
        if not other_user_id:
            return Response({'error': 'user_id is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            other_user = User.objects.get(id=other_user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Find existing DM room
        existing = ChatRoom.objects.filter(
            room_type='private',
            participants=request.user
        ).filter(participants=other_user).first()

        if existing:
            serializer = self.get_serializer(existing)
            return Response({'data': serializer.data})

        room = ChatRoom.objects.create(
            room_type='private',
            name=f"DM: {request.user.username} & {other_user.username}"
        )
        room.participants.add(request.user, other_user)
        serializer = self.get_serializer(room)
        return Response({'data': serializer.data}, status=status.HTTP_201_CREATED)


class MessageViewSet(viewsets.ModelViewSet):
    """
    Messages for a channel or DM.
    Frontend: GET /api/messages/?channel=<id> or ?thread=<id>
    """
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Message.objects.filter(room__participants=user).select_related('sender', 'room')
        channel_id = self.request.query_params.get('channel') or self.request.query_params.get('thread')
        if channel_id:
            qs = qs.filter(room_id=channel_id)
        return qs.order_by('-created_at')

    def create(self, request, *args, **kwargs):
        room_id = request.data.get('room') or request.data.get('channel')
        content = request.data.get('content', '').strip()
        if not room_id or not content:
            return Response({'error': 'room and content are required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            room = ChatRoom.objects.get(id=room_id, participants=request.user)
        except ChatRoom.DoesNotExist:
            return Response({'error': 'Room not found or access denied.'}, status=status.HTTP_404_NOT_FOUND)
        message = Message.objects.create(room=room, sender=request.user, content=content)
        serializer = self.get_serializer(message)
        return Response({'data': serializer.data}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def react(self, request, pk=None):
        # Simple reaction placeholder
        return Response({'message': 'Reaction noted.'})

    @action(detail=True, methods=['post'])
    def pin(self, request, pk=None):
        return Response({'message': 'Message pinned.'})

    def partial_update(self, request, *args, **kwargs):
        msg = self.get_object()
        if msg.sender != request.user:
            return Response({'error': 'Cannot edit others\' messages.'}, status=status.HTTP_403_FORBIDDEN)
        msg.content = request.data.get('content', msg.content)
        msg.save()
        return Response({'data': self.get_serializer(msg).data})

    def destroy(self, request, *args, **kwargs):
        msg = self.get_object()
        if msg.sender != request.user:
            return Response({'error': 'Cannot delete others\' messages.'}, status=status.HTTP_403_FORBIDDEN)
        msg.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# Keep legacy views for compatibility
class ChatRoomListCreateView(generics.ListCreateAPIView):
    queryset = ChatRoom.objects.all()
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ChatRoom.objects.filter(participants=self.request.user)


class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Message.objects.filter(room__participants=self.request.user)
        room_id = self.request.query_params.get('room') or self.request.query_params.get('channel')
        if room_id:
            qs = qs.filter(room_id=room_id)
        return qs.order_by('created_at')
