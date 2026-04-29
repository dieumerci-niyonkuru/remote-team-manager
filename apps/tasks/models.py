import uuid
from django.db import models
from django.conf import settings
from apps.projects.models import Project


class Task(models.Model):
    class Status(models.TextChoices):
        TODO        = 'todo',        'To Do'
        IN_PROGRESS = 'in_progress', 'In Progress'
        DONE        = 'done',        'Done'

    class Priority(models.TextChoices):
        LOW    = 'low',    'Low'
        MEDIUM = 'medium', 'Medium'
        HIGH   = 'high',   'High'

    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project     = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    title       = models.CharField(max_length=200)
    description = models.TextField(blank=True, default='')
    status      = models.CharField(max_length=20, choices=Status.choices, default=Status.TODO)
    priority    = models.CharField(max_length=10, choices=Priority.choices, default=Priority.MEDIUM)
    assignee    = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tasks')
    created_by  = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='created_tasks')
    due_date    = models.DateField(null=True, blank=True)
    progress    = models.PositiveIntegerField(default=0)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.title} [{self.status}]'

    def update_progress(self):
        subtasks = self.subtasks.all()
        if not subtasks.exists():
            return
        completed = subtasks.filter(is_completed=True).count()
        self.progress = int((completed / subtasks.count()) * 100)
        self.save(update_fields=['progress'])


class Subtask(models.Model):
    id           = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task         = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='subtasks')
    title        = models.CharField(max_length=200)
    is_completed = models.BooleanField(default=False)
    created_at   = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f'{self.title} ({"done" if self.is_completed else "pending"})'


class TimeLog(models.Model):
    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task        = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='timelogs')
    user        = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='timelogs')
    hours       = models.DecimalField(max_digits=5, decimal_places=2)
    description = models.TextField(blank=True, default='')
    logged_at   = models.DateField()
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-logged_at']

    def __str__(self):
        return f'{self.user.email} — {self.hours}h on {self.task.title}'


class ActivityFeed(models.Model):
    class Action(models.TextChoices):
        CREATED = 'created', 'Created'
        UPDATED = 'updated', 'Updated'
        DELETED = 'deleted', 'Deleted'

    id          = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    workspace   = models.ForeignKey('workspaces.Workspace', on_delete=models.CASCADE, related_name='activities')
    actor       = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='activities')
    action      = models.CharField(max_length=20, choices=Action.choices)
    object_type = models.CharField(max_length=50)
    object_id   = models.UUIDField()
    object_name = models.CharField(max_length=200, default='')
    timestamp   = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f'{self.actor} {self.action} {self.object_type}'

class Comment(models.Model):
    parent = models.ForeignKey("self", on_delete=models.CASCADE, null=True, blank=True, related_name="replies")
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='task_comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

class TaskAttachment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='task_files/')
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)

import re
from apps.users.models import User

def extract_mentions(content, workspace):
    usernames = re.findall(r'@(\w+)', content)
    return User.objects.filter(username__in=usernames)  # adjust to your user field

# Update Comment.save to create notifications for mentions
def save_with_mentions(self, *args, **kwargs):
    super(Comment, self).save(*args, **kwargs)
    from apps.notifications.models import Notification
    mentioned = extract_mentions(self.content, self.task.project.workspace)
    for user in mentioned:
        if user != self.author:
            Notification.objects.create(
                recipient=user,
                actor=self.author,
                verb='mentioned',
                target_ct='comment',
                target_id=self.id,
            )

# Monkey patch – but better: override the save method in the Comment class.
# Since we cannot easily replace the existing class, we'll create a new method.
# Actually, we can define a new model method. For simplicity, I'll provide the full model code.
class Comment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='task_comments')
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='replies')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Extract mentions and create notifications
        import re
        from apps.users.models import User
        from apps.notifications.models import Notification
        usernames = re.findall(r'@(\w+)', self.content)
        for username in usernames:
            user = User.objects.filter(email=username).first() or User.objects.filter(first_name=username).first()
            if user and user != self.author:
                Notification.objects.get_or_create(
                    recipient=user,
                    actor=self.author,
                    verb='mentioned',
                    target_ct='comment',
                    target_id=self.id,
                )