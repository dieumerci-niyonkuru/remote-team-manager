from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Task
from .serializers import TaskSerializer

@receiver(post_save, sender=Task)
def broadcast_task_update(sender, instance, created, **kwargs):
    channel_layer = get_channel_layer()
    workspace_id = instance.project.workspace.id
    
    async_to_sync(channel_layer.group_send)(
        f'tasks_{workspace_id}',
        {
            'type': 'task_update',
            'action': 'created' if created else 'updated',
            'task': TaskSerializer(instance).data
        }
    )

@receiver(post_delete, sender=Task)
def broadcast_task_delete(sender, instance, **kwargs):
    channel_layer = get_channel_layer()
    workspace_id = instance.project.workspace.id
    
    async_to_sync(channel_layer.group_send)(
        f'tasks_{workspace_id}',
        {
            'type': 'task_update',
            'action': 'deleted',
            'task_id': instance.id
        }
    )
