import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async


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

        is_member = await self._is_room_participant(user, self.room_id)
        if not is_member:
            await self.close(code=4004)
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

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
    def _save_message(self, content, reply_to_id=None, file_url=None, file_name=None, file_type=None):
        from .models import ChatRoom, Message
        try:
            room = ChatRoom.objects.get(id=self.room_id)
            reply_to = None
            if reply_to_id:
                try:
                    reply_to = Message.objects.get(id=reply_to_id, room=room)
                except Message.DoesNotExist:
                    pass
            msg = Message.objects.create(
                room=room,
                sender=self.user,
                content=content,
                reply_to=reply_to,
                file_url=file_url,
                file_name=file_name,
                file_type=file_type,
            )
            reply_data = None
            if msg.reply_to:
                reply_data = {
                    'id': msg.reply_to.id,
                    'content': msg.reply_to.content[:100],
                    'sender': msg.reply_to.sender.username,
                }
            return {
                'id': msg.id,
                'content': msg.content,
                'sender': {
                    'id': self.user.id,
                    'username': self.user.username,
                    'first_name': self.user.first_name,
                    'last_name': self.user.last_name,
                },
                'reply_to': reply_data,
                'file_url': msg.file_url,
                'file_name': msg.file_name,
                'file_type': msg.file_type,
                'is_edited': False,
                'is_deleted': False,
                'is_pinned': False,
                'reactions': [],
                'reaction_summary': [],
                'created_at': msg.created_at.isoformat(),
                'room': room.id,
            }
        except ChatRoom.DoesNotExist:
            return None

    @database_sync_to_async
    def _toggle_reaction(self, message_id, emoji):
        from .models import Message, MessageReaction
        try:
            msg = Message.objects.get(id=message_id)
            reaction, created = MessageReaction.objects.get_or_create(
                message=msg, user=self.user, emoji=emoji
            )
            if not created:
                reaction.delete()
                action_taken = 'removed'
            else:
                action_taken = 'added'
            summary = {}
            for r in msg.reactions.select_related('user'):
                if r.emoji not in summary:
                    summary[r.emoji] = {'emoji': r.emoji, 'count': 0, 'users': []}
                summary[r.emoji]['count'] += 1
                summary[r.emoji]['users'].append(r.user.username)
            return {
                'message_id': message_id,
                'action': action_taken,
                'emoji': emoji,
                'user': self.user.username,
                'reaction_summary': list(summary.values()),
            }
        except Message.DoesNotExist:
            return None

    @database_sync_to_async
    def _edit_message(self, message_id, content):
        from .models import Message
        try:
            msg = Message.objects.get(id=message_id, sender=self.user, is_deleted=False)
            msg.content = content
            msg.is_edited = True
            msg.save(update_fields=['content', 'is_edited', 'updated_at'])
            return {'message_id': message_id, 'content': content, 'is_edited': True}
        except Message.DoesNotExist:
            return None

    @database_sync_to_async
    def _delete_message(self, message_id):
        from .models import Message
        try:
            msg = Message.objects.get(id=message_id, sender=self.user)
            msg.is_deleted = True
            msg.content = '[This message was deleted]'
            msg.save(update_fields=['is_deleted', 'content', 'updated_at'])
            return {'message_id': message_id}
        except Message.DoesNotExist:
            return None

    @database_sync_to_async
    def _pin_message(self, message_id):
        from .models import Message
        try:
            msg = Message.objects.get(id=message_id, room_id=self.room_id)
            msg.is_pinned = not msg.is_pinned
            msg.save(update_fields=['is_pinned'])
            return {'message_id': message_id, 'is_pinned': msg.is_pinned}
        except Message.DoesNotExist:
            return None

    async def disconnect(self, close_code):
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'user_leave',
                'user_id': self.user.id if hasattr(self, 'user') else None,
                'username': self.user.username if hasattr(self, 'user') else '',
            })

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

        if msg_type == 'react':
            result = await self._toggle_reaction(data.get('message_id'), data.get('emoji', ''))
            if result:
                await self.channel_layer.group_send(self.room_group_name, {
                    'type': 'reaction_update',
                    **result,
                })
            return

        if msg_type == 'edit':
            result = await self._edit_message(data.get('message_id'), data.get('content', '').strip())
            if result:
                await self.channel_layer.group_send(self.room_group_name, {
                    'type': 'message_edited',
                    **result,
                })
            return

        if msg_type == 'delete':
            result = await self._delete_message(data.get('message_id'))
            if result:
                await self.channel_layer.group_send(self.room_group_name, {
                    'type': 'message_deleted',
                    **result,
                })
            return

        if msg_type == 'pin':
            result = await self._pin_message(data.get('message_id'))
            if result:
                await self.channel_layer.group_send(self.room_group_name, {
                    'type': 'message_pinned',
                    **result,
                })
            return

        # Regular text message
        content = data.get('message', '').strip()
        if not content:
            return

        saved = await self._save_message(
            content,
            reply_to_id=data.get('reply_to_id'),
            file_url=data.get('file_url'),
            file_name=data.get('file_name'),
            file_type=data.get('file_type'),
        )
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

    async def reaction_update(self, event):
        await self.send(text_data=json.dumps({
            'type': 'reaction',
            'message_id': event['message_id'],
            'emoji': event['emoji'],
            'action': event['action'],
            'user': event['user'],
            'reaction_summary': event['reaction_summary'],
        }))

    async def message_edited(self, event):
        await self.send(text_data=json.dumps({
            'type': 'edited',
            'message_id': event['message_id'],
            'content': event['content'],
            'is_edited': event['is_edited'],
        }))

    async def message_deleted(self, event):
        await self.send(text_data=json.dumps({
            'type': 'deleted',
            'message_id': event['message_id'],
        }))

    async def message_pinned(self, event):
        await self.send(text_data=json.dumps({
            'type': 'pinned',
            'message_id': event['message_id'],
            'is_pinned': event['is_pinned'],
        }))

    async def user_join(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_join',
            'user_id': event['user_id'],
            'username': event['username'],
        }))

    async def user_leave(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_leave',
            'user_id': event['user_id'],
            'username': event['username'],
        }))
