from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Task
import logging

logger = logging.getLogger(__name__)


def _broadcast(workspace_id, payload):
    """Broadcast task event via channel layer — silently skipped if unavailable."""
    try:
        from channels.layers import get_channel_layer
        from asgiref.sync import async_to_sync
        channel_layer = get_channel_layer()
        if channel_layer is None:
            return
        async_to_sync(channel_layer.group_send)(
            f'tasks_{workspace_id}',
            {'type': 'task_update', **payload}
        )
    except Exception as e:
        logger.debug('Task broadcast skipped: %s', e)


@receiver(post_save, sender=Task)
def broadcast_task_update(sender, instance, created, **kwargs):
    try:
        workspace_id = instance.project.workspace_id
        from .serializers import TaskSerializer
        _broadcast(workspace_id, {
            'action': 'created' if created else 'updated',
            'task': TaskSerializer(instance).data,
        })
    except Exception as e:
        logger.debug('broadcast_task_update error: %s', e)


@receiver(post_delete, sender=Task)
def broadcast_task_delete(sender, instance, **kwargs):
    try:
        workspace_id = instance.project.workspace_id
        _broadcast(workspace_id, {
            'action': 'deleted',
            'task_id': instance.id,
        })
    except Exception as e:
        logger.debug('broadcast_task_delete error: %s', e)
