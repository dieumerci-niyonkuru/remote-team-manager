from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Task, Subtask, ActivityFeed


def log_activity(workspace, actor, action, obj):
    ActivityFeed.objects.create(
        workspace=workspace,
        actor=actor,
        action=action,
        object_type=obj.__class__.__name__.lower(),
        object_id=obj.id,
        object_name=str(obj.title if hasattr(obj, 'title') else obj),
    )


@receiver(post_save, sender=Subtask)
def update_task_progress_on_subtask_save(sender, instance, **kwargs):
    instance.task.update_progress()
