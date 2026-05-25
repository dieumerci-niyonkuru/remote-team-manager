from rest_framework import generics, viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import ChatRoom, Message, MessageReaction, ReadReceipt
from .serializers import ChatRoomSerializer, MessageSerializer
from apps.accounts.models import User


class ChannelViewSet(viewsets.ModelViewSet):
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        workspace_id = self.request.query_params.get('workspace')
        qs = ChatRoom.objects.filter(
            room_type__in=['group', 'workspace'],
            participants=user,
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
    def leave(self, request, pk=None):
        room = self.get_object()
        room.participants.remove(request.user)
        return Response({'message': 'Left channel.'})

    @action(detail=True, methods=['post'])
    def read(self, request, pk=None):
        room = self.get_object()
        unread = Message.objects.filter(room=room, is_deleted=False).exclude(sender=request.user)
        for msg in unread:
            ReadReceipt.objects.get_or_create(message=msg, user=request.user)
        unread.update(is_read=True)
        return Response({'message': 'Marked as read.'})

    @action(detail=True, methods=['get'])
    def pinned(self, request, pk=None):
        room = self.get_object()
        msgs = room.messages.filter(is_pinned=True, is_deleted=False).order_by('-created_at')
        return Response({'data': MessageSerializer(msgs, many=True, context={'request': request}).data})

    @action(detail=True, methods=['get'])
    def search(self, request, pk=None):
        room = self.get_object()
        q = request.query_params.get('q', '').strip()
        if not q:
            return Response({'data': []})
        msgs = room.messages.filter(content__icontains=q, is_deleted=False).order_by('-created_at')[:50]
        return Response({'data': MessageSerializer(msgs, many=True, context={'request': request}).data})


class DirectMessageViewSet(viewsets.ModelViewSet):
    serializer_class = ChatRoomSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ChatRoom.objects.filter(
            room_type='private',
            participants=self.request.user,
        ).distinct()

    def create(self, request, *args, **kwargs):
        other_user_id = request.data.get('user_id') or request.data.get('recipient')
        if not other_user_id:
            return Response({'error': 'user_id is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            other_user = User.objects.get(id=other_user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        existing = ChatRoom.objects.filter(
            room_type='private',
            participants=request.user,
        ).filter(participants=other_user).first()

        if existing:
            serializer = self.get_serializer(existing, context={'request': request})
            return Response({'data': serializer.data})

        room = ChatRoom.objects.create(
            room_type='private',
            name=f"DM: {request.user.username} & {other_user.username}",
        )
        room.participants.add(request.user, other_user)
        serializer = self.get_serializer(room, context={'request': request})
        return Response({'data': serializer.data}, status=status.HTTP_201_CREATED)


class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Message.objects.filter(
            room__participants=user,
        ).select_related('sender', 'room', 'reply_to', 'reply_to__sender').prefetch_related(
            'reactions__user', 'read_receipts__user',
        )
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

        reply_to_id = request.data.get('reply_to')
        reply_to = None
        if reply_to_id:
            try:
                reply_to = Message.objects.get(id=reply_to_id, room=room)
            except Message.DoesNotExist:
                pass

        message = Message.objects.create(
            room=room,
            sender=request.user,
            content=content,
            reply_to=reply_to,
            file_url=request.data.get('file_url'),
            file_name=request.data.get('file_name'),
            file_type=request.data.get('file_type'),
        )
        serializer = self.get_serializer(message, context={'request': request})
        return Response({'data': serializer.data}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def react(self, request, pk=None):
        msg = self.get_object()
        emoji = request.data.get('emoji', '').strip()
        if not emoji:
            return Response({'error': 'emoji is required.'}, status=status.HTTP_400_BAD_REQUEST)

        reaction, created = MessageReaction.objects.get_or_create(
            message=msg, user=request.user, emoji=emoji,
        )
        if not created:
            reaction.delete()
            action_taken = 'removed'
        else:
            action_taken = 'added'

        serializer = self.get_serializer(msg, context={'request': request})
        return Response({'data': serializer.data, 'action': action_taken})

    @action(detail=True, methods=['post'])
    def pin(self, request, pk=None):
        msg = self.get_object()
        msg.is_pinned = not msg.is_pinned
        msg.save(update_fields=['is_pinned'])
        state = 'pinned' if msg.is_pinned else 'unpinned'
        return Response({'message': f'Message {state}.', 'is_pinned': msg.is_pinned})

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        msg = self.get_object()
        ReadReceipt.objects.get_or_create(message=msg, user=request.user)
        msg.is_read = True
        msg.save(update_fields=['is_read'])
        return Response({'message': 'Marked as read.'})

    @action(detail=True, methods=['get'])
    def thread(self, request, pk=None):
        msg = self.get_object()
        replies = msg.replies.filter(is_deleted=False).select_related(
            'sender', 'reply_to',
        ).prefetch_related('reactions__user')
        return Response({'data': MessageSerializer(replies, many=True, context={'request': request}).data})

    def partial_update(self, request, *args, **kwargs):
        msg = self.get_object()
        if msg.sender != request.user:
            return Response({'error': "Cannot edit others' messages."}, status=status.HTTP_403_FORBIDDEN)
        new_content = request.data.get('content', '').strip()
        if not new_content:
            return Response({'error': 'Content cannot be empty.'}, status=status.HTTP_400_BAD_REQUEST)
        msg.content = new_content
        msg.is_edited = True
        msg.save(update_fields=['content', 'is_edited', 'updated_at'])
        return Response({'data': self.get_serializer(msg, context={'request': request}).data})

    def destroy(self, request, *args, **kwargs):
        msg = self.get_object()
        if msg.sender != request.user:
            return Response({'error': "Cannot delete others' messages."}, status=status.HTTP_403_FORBIDDEN)
        msg.is_deleted = True
        msg.content = '[This message was deleted]'
        msg.save(update_fields=['is_deleted', 'content', 'updated_at'])
        return Response(status=status.HTTP_204_NO_CONTENT)
