from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from apps.tasks.models import Task, Comment
from apps.chat.models import Message
from .models import Notification

@receiver(post_save, sender=Task)
def task_assigned_notification(sender, instance, created, **kwargs):
    if instance.assignee and instance.assignee != instance.created_by:
        Notification.objects.create(
            recipient=instance.assignee,
            actor=instance.created_by,
            verb='assigned',
            target_ct='task',
            target_id=instance.id
        )

@receiver(post_save, sender=Comment)
def comment_notification(sender, instance, created, **kwargs):
    if instance.author != instance.task.created_by:
        Notification.objects.create(
            recipient=instance.task.created_by,
            actor=instance.author,
            verb='commented',
            target_ct='task',
            target_id=instance.task.id
        )

@receiver(post_save, sender=Message)
def message_notification(sender, instance, created, **kwargs):
    # Notify channel members (simplified)
    for member in instance.channel.members.all():
        if member != instance.sender:
            Notification.objects.create(
                recipient=member,
                actor=instance.sender,
                verb='message',
                target_ct='channel',
                target_id=instance.channel.id
            )
