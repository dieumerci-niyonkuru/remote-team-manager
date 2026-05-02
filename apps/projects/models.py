from django.db import models
from django.conf import settings
from apps.workspaces.models import Workspace

class Project(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    workspace = models.ForeignKey(Workspace, on_delete=models.CASCADE, related_name='projects')
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Task(models.Model):
    STATUS_CHOICES = (
        ('todo', 'To Do'),
        ('in_progress', 'In Progress'),
        ('done', 'Done'),
    )
    PRIORITY_CHOICES = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    )
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    assignee = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='todo')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    due_date = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='created_tasks')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Subtask(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='subtasks')
    title = models.CharField(max_length=200)
    is_completed = models.BooleanField(default=False)

class Comment(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

class Reaction(models.Model):
    comment = models.ForeignKey(Comment, on_delete=models.CASCADE, related_name='reactions')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    emoji = models.CharField(max_length=10)

class ProjectFile(models.Model):
    project = models.ForeignKey('Project', on_delete=models.CASCADE, related_name='files')
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    file = models.FileField(upload_to='project_files/')
    filename = models.CharField(max_length=255)
    version = models.IntegerField(default=1)
    uploaded_at = models.DateTimeField(auto_now_add=True)

class TaskFile(models.Model):
    task = models.ForeignKey('Task', on_delete=models.CASCADE, related_name='files')
    uploaded_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    file = models.FileField(upload_to='task_files/')
    filename = models.CharField(max_length=255)
    version = models.IntegerField(default=1)
    uploaded_at = models.DateTimeField(auto_now_add=True)

class Suggestion(models.Model):
    task = models.ForeignKey('Task', on_delete=models.CASCADE, related_name='suggestions')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
