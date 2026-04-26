from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Task, Subtask, ActivityFeed


def log_activity(workspace, actor, action, obj, name=''):
    ActivityFeed.objects.create(
        workspace=workspace,
        actor=actor,
        action=action,
        object_type=obj.__class__.__name__.lower(),
        object_id=obj.id,
        object_name=name or str(getattr(obj, 'title', str(obj))),
    )


@receiver(post_save, sender=Task)
def task_saved(sender, instance, created, **kwargs):
    workspace = instance.project.workspace
    actor     = getattr(instance, '_actor', None)
    if not actor:
        return
    action = ActivityFeed.Action.CREATED if created else ActivityFeed.Action.UPDATED
    log_activity(workspace, actor, action, instance)


@receiver(post_delete, sender=Task)
def task_deleted(sender, instance, **kwargs):
    workspace = instance.project.workspace
    actor     = getattr(instance, '_actor', None)
    if not actor:
        return
    log_activity(workspace, actor, ActivityFeed.Action.DELETED, instance)


@receiver(post_save, sender=Subtask)
def subtask_saved(sender, instance, created, **kwargs):
    instance.task.update_progress()


@receiver(post_delete, sender=Subtask)
def subtask_deleted(sender, instance, **kwargs):
    instance.task.update_progress()
