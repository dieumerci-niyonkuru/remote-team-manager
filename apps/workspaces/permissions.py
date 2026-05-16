from rest_framework import permissions
from .models import WorkspaceMember

class IsWorkspaceMember(permissions.BasePermission):
    def has_permission(self, request, view):
        if view.action == 'create':
            workspace_id = request.data.get('workspace')
            if workspace_id:
                return WorkspaceMember.objects.filter(workspace_id=workspace_id, user=request.user).exists()
            project_id = request.data.get('project')
            if project_id:
                from apps.projects.models import Project
                try:
                    project = Project.objects.get(id=project_id)
                    return WorkspaceMember.objects.filter(workspace=project.workspace, user=request.user).exists()
                except Project.DoesNotExist:
                    return False
            task_id = request.data.get('task')
            if task_id:
                from apps.projects.models import Task
                try:
                    task = Task.objects.get(id=task_id)
                    return WorkspaceMember.objects.filter(workspace=task.project.workspace, user=request.user).exists()
                except Task.DoesNotExist:
                    return False
        return True

    def has_object_permission(self, request, view, obj):
        try:
            if hasattr(obj, 'workspace'):
                workspace = obj.workspace
            elif hasattr(obj, 'project'):
                workspace = obj.project.workspace
            elif hasattr(obj, 'task'):
                workspace = obj.task.project.workspace
            else:
                workspace = obj
            return workspace.workspacemember_set.filter(user=request.user).exists()
        except:
            return False

class HasWorkspaceRole(permissions.BasePermission):
    def __init__(self, allowed_roles):
        self.allowed_roles = allowed_roles

    def has_object_permission(self, request, view, obj):
        try:
            member = obj.workspacemember_set.get(user=request.user)
            return member.role in self.allowed_roles
        except:
            return False

class IsWorkspaceAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if view.action in ['create', 'update', 'partial_update', 'destroy']:
            workspace_id = request.data.get('workspace')
            if workspace_id:
                return WorkspaceMember.objects.filter(workspace_id=workspace_id, user=request.user, role__in=['owner', 'manager']).exists()
            project_id = request.data.get('project')
            if project_id:
                from apps.projects.models import Project
                try:
                    project = Project.objects.get(id=project_id)
                    return WorkspaceMember.objects.filter(workspace=project.workspace, user=request.user, role__in=['owner', 'manager']).exists()
                except Project.DoesNotExist:
                    return False
            # Check for URL kwargs like pk
            if 'pk' in view.kwargs:
                return True # Fallback to has_object_permission
        return True

    def has_object_permission(self, request, view, obj):
        try:
            if hasattr(obj, 'workspace'):
                workspace = obj.workspace
            elif hasattr(obj, 'project'):
                workspace = obj.project.workspace
            elif hasattr(obj, 'task'):
                workspace = obj.task.project.workspace
            else:
                workspace = obj
            return workspace.workspacemember_set.filter(user=request.user, role__in=['owner', 'manager']).exists()
        except:
            return False

class IsWorkspaceDeveloperOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        if view.action in ['create', 'update', 'partial_update', 'destroy']:
            workspace_id = request.data.get('workspace')
            if workspace_id:
                return WorkspaceMember.objects.filter(workspace_id=workspace_id, user=request.user, role__in=['owner', 'manager', 'developer']).exists()
            project_id = request.data.get('project')
            if project_id:
                from apps.projects.models import Project
                try:
                    project = Project.objects.get(id=project_id)
                    return WorkspaceMember.objects.filter(workspace=project.workspace, user=request.user, role__in=['owner', 'manager', 'developer']).exists()
                except Project.DoesNotExist:
                    return False
            if 'pk' in view.kwargs:
                return True
        return True

    def has_object_permission(self, request, view, obj):
        try:
            if hasattr(obj, 'workspace'):
                workspace = obj.workspace
            elif hasattr(obj, 'project'):
                workspace = obj.project.workspace
            elif hasattr(obj, 'task'):
                workspace = obj.task.project.workspace
            else:
                workspace = obj
            return workspace.workspacemember_set.filter(user=request.user, role__in=['owner', 'manager', 'developer']).exists()
        except:
            return False
