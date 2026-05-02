from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Channel, Message, DirectMessage, ChannelMembership, MessageReaction
from .serializers import ChannelSerializer, MessageSerializer, DirectMessageSerializer

class ChannelViewSet(viewsets.ModelViewSet):
    serializer_class = ChannelSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Channel.objects.none()  # placeholder

    def get_queryset(self):
        user = self.request.user
        workspace_ids = user.workspaces.values_list('id', flat=True)
        public = Q(workspace__in=workspace_ids, is_private=False)
        member = Q(channelmembership__user=user, channelmembership__is_pending=False)
        return Channel.objects.filter(public | member).distinct()

    def perform_create(self, serializer):
        workspace = self.request.data.get('workspace')
        serializer.save(created_by=self.request.user, workspace_id=workspace)

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        channel = self.get_object()
        membership, created = ChannelMembership.objects.get_or_create(channel=channel, user=request.user)
        if channel.is_private and not created:
            return Response({'error': 'Already requested or member'}, status=status.HTTP_400_BAD_REQUEST)
        membership.is_pending = channel.is_private
        membership.save()
        return Response({'status': 'request sent' if channel.is_private else 'joined'})

    @action(detail=True, methods=['post'])
    def approve_join(self, request, pk=None):
        channel = self.get_object()
        if request.user != channel.created_by:
            return Response({'error': 'Only channel creator can approve'}, status=status.HTTP_403_FORBIDDEN)
        user_id = request.data.get('user_id')
        membership = ChannelMembership.objects.get(channel=channel, user_id=user_id)
        membership.is_pending = False
        membership.save()
        return Response({'status': 'approved'})

    @action(detail=True, methods=['get'])
    def members(self, request, pk=None):
        channel = self.get_object()
        memberships = channel.memberships.filter(is_pending=False)
        from .serializers import ChannelMembershipSerializer
        return Response(ChannelMembershipSerializer(memberships, many=True).data)

class DirectMessageViewSet(viewsets.ModelViewSet):
    serializer_class = DirectMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = DirectMessage.objects.none()

    def get_queryset(self):
        return DirectMessage.objects.filter(participants=self.request.user)

    def perform_create(self, serializer):
        dm = serializer.save()
        dm.participants.add(self.request.user)
        other_user_id = self.request.data.get('other_user')
        dm.participants.add(other_user_id)

class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Message.objects.none()

    def get_queryset(self):
        return Message.objects.filter(
            Q(channel__memberships__user=self.request.user) |
            Q(direct_message__participants=self.request.user)
        ).distinct()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
