from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.tasks.models import Task, Comment
from apps.users.models import User
from .models import Notification

@receiver(post_save, sender=Task)
def task_assigned_notification(sender, instance, created, **kwargs):
    if created and instance.assignee:
        Notification.objects.create(
            recipient=instance.assignee, actor=instance.created_by,
            verb='task_assigned', target_ct='task', target_id=instance.id
        )

@receiver(post_save, sender=Comment)
def comment_notification(sender, instance, created, **kwargs):
    if created and instance.author != instance.task.created_by:
        Notification.objects.create(
            recipient=instance.task.created_by, actor=instance.author,
            verb='commented', target_ct='task', target_id=instance.task.id
        )
