import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.utils.timezone import now


class PresenceConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        await self.send(text_data=json.dumps({"status": "online"}))

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        pass


class WorkspaceConsumer(AsyncWebsocketConsumer):
    """Broadcasts workspace-level events: task updates, presence, notifications."""

    async def connect(self):
        self.user = self.scope.get('user')
        if not self.user or not self.user.is_authenticated:
            await self.close()
            return

        workspace_id = self.scope['url_route']['kwargs']['workspace_id']
        self.group_name = f'workspace_{workspace_id}'

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        # Update presence
        await self.update_presence('online')

        # Notify others of join
        await self.channel_layer.group_send(self.group_name, {
            'type': 'user_presence',
            'user_id': self.user.id,
            'username': self.user.username,
            'status': 'online',
        })

    async def disconnect(self, code):
        if hasattr(self, 'group_name'):
            await self.update_presence('offline')
            await self.channel_layer.group_send(self.group_name, {
                'type': 'user_presence',
                'user_id': self.user.id,
                'username': self.user.username,
                'status': 'offline',
            })
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        try:
            data = json.loads(text_data)
        except (json.JSONDecodeError, TypeError):
            return

        event_type = data.get('type')

        if event_type == 'task_update':
            await self.channel_layer.group_send(self.group_name, {
                'type': 'task_updated',
                'task': data.get('task', {}),
                'action': data.get('action', 'update'),
                'sender_id': self.user.id,
            })
        elif event_type == 'cursor_move':
            await self.channel_layer.group_send(self.group_name, {
                'type': 'cursor_moved',
                'x': data.get('x'),
                'y': data.get('y'),
                'user_id': self.user.id,
                'color': data.get('color', '#3366ff'),
            })
        elif event_type == 'heartbeat':
            await self.update_presence('online')

    async def task_updated(self, event):
        if event.get('sender_id') != self.user.id:
            await self.send(text_data=json.dumps({'type': 'task_update', **event}))

    async def user_presence(self, event):
        await self.send(text_data=json.dumps({'type': 'presence', **event}))

    async def cursor_moved(self, event):
        if event.get('user_id') != self.user.id:
            await self.send(text_data=json.dumps({'type': 'cursor', **event}))

    async def workspace_broadcast(self, event):
        await self.send(text_data=json.dumps({'type': 'broadcast', **event}))

    @database_sync_to_async
    def update_presence(self, status):
        try:
            from apps.presence.models import Presence
            Presence.objects.update_or_create(
                user=self.user,
                defaults={'status': status, 'last_activity': now()}
            )
        except Exception:
            pass
