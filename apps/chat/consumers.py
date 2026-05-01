import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import ChatRoom, ChatMessage
from django.contrib.auth.models import AnonymousUser

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'

        user = self.scope['user']
        if user.is_anonymous:
            await self.close()
            return

        room_exists = await self.room_exists(self.room_id, user)
        if not room_exists:
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

        saved_message = await self.save_message(self.room_id, user, message)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': message,
                'username': user.username,
                'timestamp': saved_message.timestamp.isoformat(),
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'message': event['message'],
            'username': event['username'],
            'timestamp': event['timestamp'],
        }))

    @database_sync_to_async
    def room_exists(self, room_id, user):
        try:
            room = ChatRoom.objects.get(id=room_id)
            return room.members.filter(id=user.id).exists() or not room.is_private
        except ChatRoom.DoesNotExist:
            return False

    @database_sync_to_async
    def save_message(self, room_id, user, content):
        room = ChatRoom.objects.get(id=room_id)
        return ChatMessage.objects.create(room=room, user=user, content=content)
