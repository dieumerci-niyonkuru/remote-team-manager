import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import WikiArticle

class WikiCollabConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.article_id = self.scope['url_route']['kwargs']['article_id']
        self.room_group_name = f'wiki_{self.article_id}'
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)
        patch = data.get('patch')
        if patch is None:
            return
        # Broadcast to other users
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'wiki_patch',
                'patch': patch,
                'sender': self.scope['user'].id,
            }
        )

    async def wiki_patch(self, event):
        # Do not send back to the sender
        if event['sender'] == self.scope['user'].id:
            return
        await self.send(text_data=json.dumps({'patch': event['patch']}))
