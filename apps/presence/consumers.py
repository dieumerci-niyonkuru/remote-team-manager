import json
from channels.generic.websocket import AsyncWebsocketConsumer

class PresenceConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        await self.send(json.dumps({"status": "online"}))

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        await self.send(json.dumps({"status": "received"}))
