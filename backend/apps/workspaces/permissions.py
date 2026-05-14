from rest_framework import permissions
from .models import WorkspaceMember

class IsWorkspaceMember(permissions.BasePermission):
    def has_permission(self, request, view):
        workspace_id = request.query_params.get('workspace') or request.data.get('workspace')
        if not workspace_id:
            return True # Let the viewset filter querysets
        return WorkspaceMember.objects.filter(workspace_id=workspace_id, user=request.user).exists()

class IsWorkspaceAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        workspace_id = request.query_params.get('workspace') or request.data.get('workspace')
        if not workspace_id:
            return False
        return WorkspaceMember.objects.filter(
            workspace_id=workspace_id, 
            user=request.user, 
            role__in=['owner', 'admin']
        ).exists()

class IsWorkspaceOwner(permissions.BasePermission):
    def has_permission(self, request, view):
        workspace_id = request.query_params.get('workspace') or request.data.get('workspace')
        if not workspace_id:
            return False
        return WorkspaceMember.objects.filter(
            workspace_id=workspace_id, 
            user=request.user, 
            role='owner'
        ).exists()
