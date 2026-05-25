import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async


class NotificationConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        user = self.scope.get('user')

        # Support token-based auth from query string if middleware auth didn't work
        if not user or user.is_anonymous:
            token = self._get_token_from_scope()
            if token:
                user = await self._get_user_from_token(token)

        if not user or user.is_anonymous:
            await self.close(code=4003)
            return

        self.user = user
        self.room_group_name = f'notify_{user.id}'

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

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

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        # Clients can send a ping to keep connection alive
        try:
            data = json.loads(text_data)
            if data.get('type') == 'ping':
                await self.send(text_data=json.dumps({'type': 'pong'}))
        except Exception:
            pass

    async def send_notification(self, event):
        """Handler for group_send with type=send_notification"""
        await self.send(text_data=json.dumps({
            'type': 'send_notification',
            'notification': event.get('notification', {}),
        }))

    async def notification_message(self, event):
        """Alt handler used by some broadcasting code"""
        await self.send(text_data=json.dumps({
            'type': 'notification_message',
            'data': event,
        }))
