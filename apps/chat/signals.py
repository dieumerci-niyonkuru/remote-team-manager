from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Message
import re


@receiver(post_save, sender=Message)
def create_mention_notifications(sender, instance, created, **kwargs):
    if not created:
        return
    content = instance.content
    mentions = re.findall(r'@(\w+)', content)
    if not mentions:
        return
    from django.contrib.auth import get_user_model
    User = get_user_model()
    from apps.notifications.models import Notification
    for username in mentions:
        try:
            user = User.objects.get(username=username)
            if user != instance.sender:
                Notification.objects.create(
                    recipient=user,
                    actor=instance.sender,
                    verb=f'mentioned you in a message: "{content[:50]}"',
                )
        except User.DoesNotExist:
            pass
