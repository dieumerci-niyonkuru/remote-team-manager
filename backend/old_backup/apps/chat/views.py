from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from apps.workspaces.models import Workspace, WorkspaceMember
from .models import Channel, Message, Reaction
from .serializers import ChannelSerializer, MessageSerializer

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def channel_list(request, workspace_pk):
    workspace = get_object_or_404(Workspace, pk=workspace_pk)
    if not WorkspaceMember.objects.filter(workspace=workspace, user=request.user).exists():
        return Response({'data': None, 'message': 'Not a member'}, status=403)
    if request.method == 'GET':
        channels = workspace.channels.all()
        return Response({'data': ChannelSerializer(channels, many=True).data, 'message': 'Success'})
    serializer = ChannelSerializer(data=request.data)
    if serializer.is_valid():
        channel = serializer.save(workspace=workspace, created_by=request.user)
        channel.members.add(request.user)
        return Response({'data': ChannelSerializer(channel).data, 'message': 'Channel created'}, status=201)
    return Response({'data': None, 'message': serializer.errors}, status=400)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def message_list(request, channel_pk):
    channel = get_object_or_404(Channel, pk=channel_pk)
    workspace = channel.workspace
    if not WorkspaceMember.objects.filter(workspace=workspace, user=request.user).exists():
        return Response({'data': None, 'message': 'Not a member'}, status=403)
    if request.method == 'GET':
        messages = channel.messages.all()
        return Response({'data': MessageSerializer(messages, many=True).data, 'message': 'Success'})
    serializer = MessageSerializer(data=request.data)
    if serializer.is_valid():
        msg = serializer.save(channel=channel, sender=request.user)
        return Response({'data': MessageSerializer(msg).data, 'message': 'Message sent'}, status=201)
    return Response({'data': None, 'message': serializer.errors}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_reaction(request, message_pk):
    message = get_object_or_404(Message, pk=message_pk)
    workspace = message.channel.workspace
    if not WorkspaceMember.objects.filter(workspace=workspace, user=request.user).exists():
        return Response({'data': None, 'message': 'Not a member'}, status=403)
    emoji = request.data.get('emoji')
    if not emoji:
        return Response({'data': None, 'message': 'Emoji required'}, status=400)
    reaction, created = Reaction.objects.get_or_create(message=message, user=request.user, emoji=emoji)
    if not created:
        reaction.delete()
        return Response({'data': None, 'message': 'Reaction removed'}, status=200)
    return Response({'data': None, 'message': 'Reaction added'}, status=201)
