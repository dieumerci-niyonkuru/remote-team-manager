from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import ChatMessage
from apps.notifications.models import Notification

@receiver(post_save, sender=ChatMessage)
def create_mention_notifications(sender, instance, created, **kwargs):
    if created:
        content = instance.content
        # Simple mention detection: @username
        import re
        mentions = re.findall(r'@(\w+)', content)
        from django.contrib.auth import get_user_model
        User = get_user_model()
        for username in mentions:
            try:
                user = User.objects.get(username=username)
                if user != instance.user:
                    Notification.objects.create(
                        recipient=user,
                        actor=instance.user,
                        verb=f'mentioned you in chat: "{content[:50]}"',
                        target=instance.room
                    )
            except User.DoesNotExist:
                pass
