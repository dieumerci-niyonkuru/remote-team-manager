from django.db.models.signals import post_save
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Notification
from .serializers import NotificationSerializer

@receiver(post_save, sender=Notification)
def broadcast_notification(sender, instance, created, **kwargs):
    if created:
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"notifications_{instance.recipient.id}",
            {
                "type": "notification_message",
                "notification": NotificationSerializer(instance).data
            }
        )
