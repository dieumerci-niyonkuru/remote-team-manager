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
    group_name = f'workspace_{workspace_id}_tasks'
    
    data = {
        'type': 'task_update',
        'data': {
            'action': 'created' if created else 'updated',
            'task': TaskSerializer(instance).data
        }
    }
    
    async_to_sync(channel_layer.group_send)(group_name, data)

@receiver(post_delete, sender=Task)
def broadcast_task_delete(sender, instance, **kwargs):
    channel_layer = get_channel_layer()
    workspace_id = instance.project.workspace.id
    group_name = f'workspace_{workspace_id}_tasks'
    
    data = {
        'type': 'task_update',
        'data': {
            'action': 'deleted',
            'task_id': instance.id
        }
    }
    
    async_to_sync(channel_layer.group_send)(group_name, data)
