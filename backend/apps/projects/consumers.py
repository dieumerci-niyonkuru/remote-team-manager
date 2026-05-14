import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async

class TaskConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.workspace_id = self.scope['url_route']['kwargs']['workspace_id']
        self.workspace_group_name = f'workspace_{self.workspace_id}_tasks'

        # Join workspace group
        await self.channel_layer.group_add(
            self.workspace_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave workspace group
        await self.channel_layer.group_discard(
            self.workspace_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.parse(text_data)
        # Handle task updates from frontend if needed
        # (Usually we use REST for updates and WS for broadcasting)
        pass

    async def task_update(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps(event['data']))
