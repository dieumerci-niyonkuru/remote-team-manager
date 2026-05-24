import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import Message, Room

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'
        self.user = self.scope['user']

        if self.user.is_anonymous:
            await self.close()
            return

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

        # Send presence update
        await self.update_presence(status='online')
        await self.send_presence_to_group()

    async def disconnect(self, close_code):
        await self.update_presence(status='offline')
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type', 'message')

        if message_type == 'message':
            message_text = data['message']
            await self.save_message(message_text)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': message_text,
                    'user': self.user.email,
                    'timestamp': str(await self.get_timestamp())
                }
            )
        elif message_type == 'typing':
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'typing_indicator',
                    'user': self.user.email,
                    'is_typing': data['is_typing']
                }
            )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message': event['message'],
            'user': event['user'],
            'timestamp': event['timestamp']
        }))

    async def typing_indicator(self, event):
        await self.send(text_data=json.dumps({
            'type': 'typing',
            'user': event['user'],
            'is_typing': event['is_typing']
        }))

    async def presence_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'presence',
            'user': event['user'],
            'status': event['status']
        }))

    @database_sync_to_async
    def save_message(self, message_text):
        room = Room.objects.get(id=self.room_id)
        return Message.objects.create(
            room=room,
            user=self.user,
            content=message_text
        )

    @database_sync_to_async
    def get_timestamp(self):
        from django.utils import timezone
        return timezone.now().isoformat()

    @database_sync_to_async
    def update_presence(self, status):
        from presence.models import Presence
        Presence.objects.update_or_create(
            user=self.user,
            defaults={'status': status, 'last_seen': None if status == 'online' else timezone.now()}
        )

    async def send_presence_to_group(self):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'presence.update',
                'user': self.user.email,
                'status': 'online'
            }
        )
