from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Message

@receiver(post_save, sender=Message)
def create_mention_notifications(sender, instance, created, **kwargs):
    if created:
        content = instance.content
        import re
        mentions = re.findall(r'@(\w+)', content)
        from django.contrib.auth import get_user_model
        User = get_user_model()
        from apps.notifications.models import Notification
        for username in mentions:
            try:
                user = User.objects.get(username=username)
                if user != instance.user:
                    Notification.objects.create(
                        recipient=user,
                        actor=instance.user,
                        verb=f'mentioned you in chat: "{content[:50]}"',
                        target=instance.channel or instance.direct_message
                    )
            except User.DoesNotExist:
                pass
