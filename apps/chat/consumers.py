import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Channel, Message
from django.contrib.auth.models import AnonymousUser
from .serializers import MessageSerializer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.channel_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.channel_id}'

        user = self.scope['user']
        if user.is_anonymous:
            await self.close()
            return

        channel_exists = await self.channel_exists(self.channel_id, user)
        if not channel_exists:
            await self.close()
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']
        user = self.scope['user']

        saved_message = await self.save_message(self.channel_id, user, message)
        serializer = await self.get_serialized_message(saved_message)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                **serializer
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))

    @database_sync_to_async
    def channel_exists(self, channel_id, user):
        try:
            channel = Channel.objects.get(id=channel_id)
            return channel.members.filter(id=user.id).exists() or not channel.is_private
        except Channel.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, channel_id, user, content):
        channel = Channel.objects.get(id=channel_id)
        return Message.objects.create(channel=channel, user=user, content=content)

    @database_sync_to_async
    def get_serialized_message(self, message):
        return MessageSerializer(message).data
