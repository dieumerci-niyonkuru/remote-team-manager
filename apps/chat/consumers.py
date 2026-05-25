import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from datetime import datetime


class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'

        user = self.scope.get('user')
        if not user or user.is_anonymous:
            token = self._get_token_from_scope()
            if token:
                user = await self._get_user_from_token(token)

        if not user or user.is_anonymous:
            await self.close(code=4003)
            return

        self.user = user

        # Verify user is a participant in this room
        is_member = await self._is_room_participant(user, self.room_id)
        if not is_member:
            await self.close(code=4004)
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        # Notify room of new presence
        await self.channel_layer.group_send(self.room_group_name, {
            'type': 'user_join',
            'user_id': user.id,
            'username': user.username,
        })

    def _get_token_from_scope(self):
        query_string = self.scope.get('query_string', b'').decode()
        for param in query_string.split('&'):
            if param.startswith('token='):
                return param[6:]
        return None

    @database_sync_to_async
    def _get_user_from_token(self, token):
        try:
            from rest_framework_simplejwt.tokens import AccessToken
            from apps.accounts.models import User
            decoded = AccessToken(token)
            return User.objects.get(id=decoded['user_id'])
        except Exception:
            return None

    @database_sync_to_async
    def _is_room_participant(self, user, room_id):
        from .models import ChatRoom
        return ChatRoom.objects.filter(id=room_id, participants=user).exists()

    @database_sync_to_async
    def _save_message(self, content):
        from .models import ChatRoom, Message
        try:
            room = ChatRoom.objects.get(id=self.room_id)
            msg = Message.objects.create(room=room, sender=self.user, content=content)
            return {
                'id': msg.id,
                'content': msg.content,
                'sender': {
                    'id': self.user.id,
                    'username': self.user.username,
                    'first_name': self.user.first_name,
                },
                'created_at': msg.created_at.isoformat(),
                'room': room.id,
            }
        except ChatRoom.DoesNotExist:
            return None

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except Exception:
            return

        msg_type = data.get('type', 'message')

        if msg_type == 'ping':
            await self.send(text_data=json.dumps({'type': 'pong'}))
            return

        if msg_type == 'typing':
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'typing_indicator',
                'user_id': self.user.id,
                'username': self.user.username,
                'is_typing': data.get('is_typing', True),
            })
            return

        # Regular message
        content = data.get('message', '').strip()
        if not content:
            return

        saved = await self._save_message(content)
        if saved:
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'chat_message',
                'message': saved,
            })

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'message',
            'message': event['message'],
        }))

    async def typing_indicator(self, event):
        await self.send(text_data=json.dumps({
            'type': 'typing',
            'user_id': event['user_id'],
            'username': event['username'],
            'is_typing': event['is_typing'],
        }))

    async def user_join(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_join',
            'user_id': event['user_id'],
            'username': event['username'],
        }))
