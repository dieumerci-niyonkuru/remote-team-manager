import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Channel, Message, MessageReaction, TypingIndicator
from django.utils.timezone import now

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.channel_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.channel_id}'

        user = self.scope['user']
        if user.is_anonymous:
            await self.close()
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        event_type = data.get('type', 'chat_message')
        user = self.scope['user']

        if event_type == 'chat_message':
            content = data['message']
            reply_to_id = data.get('reply_to')
            thread_root_id = data.get('thread_root') or data.get('thread_id')
            saved_message = await self.save_message(self.channel_id, user, content, reply_to_id, thread_root_id)
            
            if not saved_message:
                return
            
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message_broadcast',
                    'id': saved_message.id,
                    'message': content,
                    'user_id': user.id,
                    'username': user.first_name or user.username,
                    'timestamp': saved_message.created_at.isoformat(),
                    'reply_to': reply_to_id,
                    'thread_root': thread_root_id,
                }
            )
        elif event_type == 'typing':
            is_typing = data.get('is_typing', False)
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'typing_broadcast',
                    'user_id': user.id,
                    'username': user.first_name or user.username,
                    'is_typing': is_typing
                }
            )
        elif event_type == 'edit_message':
            message_id = data.get('message_id')
            new_content = data.get('message')
            saved_message = await self.edit_message(message_id, user, new_content)
            if saved_message:
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'message_update_broadcast',
                        'message_id': message_id,
                        'message': new_content,
                        'edited_at': saved_message.edited_at.isoformat()
                    }
                )
        elif event_type == 'reaction':
            message_id = data.get('message_id')
            emoji = data.get('emoji')
            # The actual save happens via REST, but we broadcast the change
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'reaction_broadcast',
                    'message_id': message_id,
                    'user_id': user.id,
                    'emoji': emoji,
                    'action': data.get('action') # 'added' or 'removed'
                }
            )

    async def chat_message_broadcast(self, event):
        await self.send(text_data=json.dumps(event))

    async def typing_broadcast(self, event):
        await self.send(text_data=json.dumps(event))

    async def reaction_broadcast(self, event):
        await self.send(text_data=json.dumps(event))

    async def message_update_broadcast(self, event):
        await self.send(text_data=json.dumps(event))

    @database_sync_to_async
    def edit_message(self, message_id, user, new_content):
        try:
            message = Message.objects.get(id=message_id, user=user)
            from .models import MessageEditHistory
            MessageEditHistory.objects.create(
                message=message,
                editor=user,
                old_content=message.content,
                new_content=new_content
            )
            message.content = new_content
            from django.utils.timezone import now
            message.edited_at = now()
            message.save()
            return message
        except Message.DoesNotExist:
            return None

    @database_sync_to_async
    def save_message(self, room_id, user, content, reply_to_id=None, thread_root_id=None):
        # Try to find channel first
        try:
            channel = Channel.objects.get(id=room_id)
            dm = None
        except (Channel.DoesNotExist, ValueError):
            # If not a channel, try to find direct message
            try:
                dm = DirectMessage.objects.get(id=room_id)
                channel = None
            except (DirectMessage.DoesNotExist, ValueError):
                return None

        reply_to = Message.objects.get(id=reply_to_id) if reply_to_id else None
        thread_root = Message.objects.get(id=thread_root_id) if thread_root_id else None
        
        return Message.objects.create(
            channel=channel, 
            direct_message=dm,
            user=user, 
            content=content, 
            reply_to=reply_to, 
            thread_root=thread_root
        )
