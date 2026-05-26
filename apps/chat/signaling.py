"""
WebRTC Signaling Consumer — handles offer/answer/ICE exchange for video/audio calls.
Supports 1-to-1 and group calls via room-based channel groups.
"""
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async


class CallSignalingConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.group_name = f'call_{self.room_id}'

        # Authenticate
        user = self.scope.get('user')
        if not user or user.is_anonymous:
            token = self._get_token()
            if token:
                user = await self._get_user_from_token(token)

        if not user or user.is_anonymous:
            await self.close(code=4003)
            return

        self.user = user

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

        # Notify others that a new participant joined
        await self.channel_layer.group_send(self.group_name, {
            'type': 'peer_event',
            'payload': {
                'type': 'user_joined',
                'user_id': user.id,
                'username': user.username,
                'display_name': user.get_full_name() or user.username,
            }
        })

    def _get_token(self):
        qs = self.scope.get('query_string', b'').decode()
        for param in qs.split('&'):
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
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_send(self.group_name, {
                'type': 'peer_event',
                'payload': {
                    'type': 'user_left',
                    'user_id': self.user.id if hasattr(self, 'user') else None,
                    'username': self.user.username if hasattr(self, 'user') else '',
                }
            })
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except Exception:
            return

        msg_type = data.get('type', '')

        # Heartbeat — keep connection alive
        if msg_type == 'heartbeat':
            await self.send(text_data=json.dumps({'type': 'pong'}))
            return

        # Call invitation — notify specific user via their personal group
        if msg_type == 'call_invite':
            target_user_id = data.get('target_user_id')
            if target_user_id:
                await self.channel_layer.group_send(f'notify_{target_user_id}', {
                    'type': 'send_notification',
                    'notification': {
                        'type': 'incoming_call',
                        'caller_id': self.user.id,
                        'caller_name': self.user.get_full_name() or self.user.username,
                        'room_id': self.room_id,
                        'call_url': f'/call?room={self.room_id}',
                    }
                })
            return

        # All other signaling events — broadcast to room group
        # (offer, answer, ice_candidate, call_accept, call_reject, call_end)
        broadcast_types = {'offer', 'answer', 'ice_candidate', 'call_accept', 'call_reject', 'call_end'}
        if msg_type in broadcast_types:
            payload = {
                'type': msg_type,
                'from_user_id': self.user.id,
                'from_username': self.user.username,
            }
            # Pass through SDP data and candidate data
            for key in ('sdp', 'candidate', 'sdpMid', 'sdpMLineIndex', 'target_user_id'):
                if key in data:
                    payload[key] = data[key]

            await self.channel_layer.group_send(self.group_name, {
                'type': 'peer_event',
                'payload': payload,
            })

    async def peer_event(self, event):
        """Relay peer signaling events to this WebSocket client."""
        payload = event.get('payload', {})
        # Don't echo back to sender (for offer/answer/ice)
        sender_id = payload.get('from_user_id')
        if sender_id and hasattr(self, 'user') and sender_id == self.user.id:
            # Still send certain events back (e.g., user_joined echoes to everyone)
            if payload.get('type') not in ('offer', 'answer', 'ice_candidate'):
                pass
            else:
                return
        await self.send(text_data=json.dumps(payload))
