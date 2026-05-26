"""
Celery async tasks for the notifications app.
Handles: email invitations, notification delivery, workspace digests.
"""
from celery import shared_task
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_invite_email(self, invite_id, join_url):
    """Send an email invitation to the invited address."""
    try:
        from .models import Invite
        invite = Invite.objects.select_related('workspace', 'invited_by').get(id=invite_id)

        if not invite.email:
            logger.info(f"Invite {invite_id} has no email — skipping email send.")
            return {'status': 'skipped', 'reason': 'no email'}

        from django.core.mail import send_mail
        from django.conf import settings

        inviter_name = (
            invite.invited_by.get_full_name() or invite.invited_by.username
        )
        workspace_name = invite.workspace.name
        expires_at = invite.expires_at.strftime('%B %d, %Y')

        subject = f"You're invited to join {workspace_name} on RemoteTeam"
        message = (
            f"Hi there,\n\n"
            f"{inviter_name} has invited you to join the workspace '{workspace_name}' "
            f"on RemoteTeam as a {invite.role}.\n\n"
            f"Click the link below to accept:\n{join_url}\n\n"
            f"This invitation expires on {expires_at}.\n\n"
            f"Best,\nThe RemoteTeam Team"
        )
        html_message = f"""
        <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 20px;background:#060b18;color:#fff;border-radius:16px">
          <h1 style="font-size:24px;font-weight:900;color:#fff;margin-bottom:8px">You're invited! 🎉</h1>
          <p style="color:rgba(255,255,255,0.6);margin-bottom:24px">
            <strong style="color:#fff">{inviter_name}</strong> has invited you to join
            <strong style="color:#3366ff">{workspace_name}</strong> on RemoteTeam as a
            <strong style="color:#fff">{invite.role}</strong>.
          </p>
          <a href="{join_url}" style="display:inline-block;padding:14px 28px;border-radius:12px;background:linear-gradient(90deg,#3366ff,#8b5cf6);color:#fff;text-decoration:none;font-weight:800;font-size:15px;margin-bottom:24px">
            Accept Invitation →
          </a>
          <p style="color:rgba(255,255,255,0.35);font-size:12px">
            Expires on {expires_at}. If you weren't expecting this, you can safely ignore it.
          </p>
        </div>
        """

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL if hasattr(settings, 'DEFAULT_FROM_EMAIL') else 'noreply@remoteteam.app',
            recipient_list=[invite.email],
            html_message=html_message,
            fail_silently=False,
        )
        logger.info(f"Invitation email sent to {invite.email} for workspace {workspace_name}")
        return {'status': 'sent', 'to': invite.email}

    except Exception as exc:
        logger.error(f"send_invite_email failed for invite {invite_id}: {exc}")
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=30)
def send_notification_email(self, recipient_id, subject, body):
    """Send a one-off notification email to a user."""
    try:
        from apps.accounts.models import User
        user = User.objects.get(id=recipient_id)

        if not user.email:
            return {'status': 'skipped', 'reason': 'no email'}

        from django.core.mail import send_mail
        from django.conf import settings

        send_mail(
            subject=subject,
            message=body,
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@remoteteam.app'),
            recipient_list=[user.email],
            fail_silently=False,
        )
        logger.info(f"Notification email sent to {user.email}")
        return {'status': 'sent', 'to': user.email}

    except Exception as exc:
        logger.error(f"send_notification_email failed for user {recipient_id}: {exc}")
        raise self.retry(exc=exc)


@shared_task
def create_notification(recipient_id, verb, description='', category='system',
                        priority='normal', actor_id=None, deep_link=''):
    """Create a Notification object and push it via WebSocket."""
    try:
        from .models import Notification
        from apps.accounts.models import User

        recipient = User.objects.get(id=recipient_id)
        actor = User.objects.get(id=actor_id) if actor_id else None

        notif = Notification.objects.create(
            recipient=recipient,
            actor=actor,
            verb=verb,
            description=description,
            category=category,
            priority=priority,
            deep_link=deep_link,
        )

        # Push via WebSocket channel layer
        from asgiref.sync import async_to_sync
        from channels.layers import get_channel_layer
        channel_layer = get_channel_layer()
        if channel_layer:
            async_to_sync(channel_layer.group_send)(
                f'notify_{recipient_id}',
                {
                    'type': 'send_notification',
                    'notification': {
                        'id': notif.id,
                        'verb': notif.verb,
                        'description': notif.description,
                        'category': notif.category,
                        'priority': notif.priority,
                        'deep_link': notif.deep_link,
                        'timestamp': notif.timestamp.isoformat(),
                        'unread': True,
                        'actor_id': actor_id,
                    },
                },
            )
        logger.info(f"Notification created for user {recipient_id}: {verb}")
        return {'status': 'ok', 'id': notif.id}

    except Exception as exc:
        logger.error(f"create_notification failed: {exc}")
        return {'status': 'error', 'error': str(exc)}


@shared_task
def send_daily_digest():
    """Send a daily digest email to all active users with their task summary."""
    try:
        from apps.accounts.models import User
        from apps.projects.models import Task
        from django.core.mail import send_mail
        from django.conf import settings
        from django.utils import timezone
        from datetime import timedelta

        yesterday = timezone.now() - timedelta(days=1)
        active_users = User.objects.filter(is_active=True).exclude(email='')

        sent = 0
        for user in active_users:
            overdue = Task.objects.filter(
                assignee=user,
                due_date__lt=timezone.now(),
                status__in=['todo', 'in_progress'],
            ).count()
            due_today = Task.objects.filter(
                assignee=user,
                due_date__date=timezone.now().date(),
            ).count()

            if overdue == 0 and due_today == 0:
                continue  # Don't spam with empty digests

            subject = f"📋 Your daily workspace summary"
            body = (
                f"Hi {user.get_full_name() or user.username},\n\n"
                f"Here's your daily task summary:\n"
                f"  • {overdue} overdue task(s)\n"
                f"  • {due_today} task(s) due today\n\n"
                f"Log in to stay on top: https://remoteteam.app/dashboard\n\n"
                f"Best,\nThe RemoteTeam Bot"
            )
            send_mail(subject, body,
                      getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@remoteteam.app'),
                      [user.email], fail_silently=True)
            sent += 1

        logger.info(f"Daily digest sent to {sent} users")
        return {'status': 'ok', 'sent': sent}

    except Exception as exc:
        logger.error(f"send_daily_digest failed: {exc}")
        return {'status': 'error', 'error': str(exc)}
