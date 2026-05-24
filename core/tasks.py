from celery import shared_task
from django.core.mail import send_mail
from django.contrib.auth import get_user_model
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import logging

User = get_user_model()
logger = logging.getLogger(__name__)

@shared_task
def send_invitation_email(recipient_email, workspace_name, invite_link):
    subject = f"Invitation to join {workspace_name} on Remote Team Manager"
    message = f"You've been invited to join {workspace_name}.\nClick: {invite_link}"
    send_mail(subject, message, 'noreply@remoteteam.com', [recipient_email])

@shared_task
def send_notification_to_user(user_id, notification_data):
    try:
        channel_layer = get_channel_layer()
        group_name = f"user_{user_id}_notifications"
        async_to_sync(channel_layer.group_send)(
            group_name,
            {'type': 'notification.message', 'data': notification_data}
        )
    except Exception as e:
        logger.error(f"Notification failed: {e}")

@shared_task
def update_presence_status(user_id, status='offline'):
    try:
        user = User.objects.get(id=user_id)
        from presence.models import Presence
        presence, _ = Presence.objects.get_or_create(user=user)
        presence.status = status
        presence.save()
        channel_layer = get_channel_layer()
        if user.current_workspace_id:
            group_name = f"workspace_{user.current_workspace_id}_presence"
            async_to_sync(channel_layer.group_send)(
                group_name,
                {'type': 'presence.update', 'user_id': user_id, 'status': status}
            )
    except Exception as e:
        logger.error(f"Presence update failed: {e}")

@shared_task
def generate_workspace_analytics(workspace_id):
    from workspaces.models import Workspace
    from analytics.services import AnalyticsService
    try:
        workspace = Workspace.objects.get(id=workspace_id)
        service = AnalyticsService(workspace)
        return service.generate_report()
    except Exception as e:
        logger.error(f"Analytics failed: {e}")
        return None
