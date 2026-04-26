from rest_framework.permissions import BasePermission
from .models import WorkspaceMember


def get_member(workspace, user):
    """Helper to get a workspace member or None."""
    try:
        return WorkspaceMember.objects.get(workspace=workspace, user=user)
    except WorkspaceMember.DoesNotExist:
        return None


class IsWorkspaceMember(BasePermission):
    """Allow any member of the workspace."""
    message = 'You are not a member of this workspace.'

    def has_object_permission(self, request, view, obj):
        return get_member(obj, request.user) is not None


class IsWorkspaceManager(BasePermission):
    """Allow only Owner or Manager."""
    message = 'You must be a Manager or Owner to perform this action.'

    def has_object_permission(self, request, view, obj):
        member = get_member(obj, request.user)
        if not member:
            return False
        return member.role in [
            WorkspaceMember.Role.OWNER,
            WorkspaceMember.Role.MANAGER,
        ]


class IsWorkspaceOwner(BasePermission):
    """Allow only the Owner."""
    message = 'Only the workspace Owner can perform this action.'

    def has_object_permission(self, request, view, obj):
        member = get_member(obj, request.user)
        if not member:
            return False
        return member.role == WorkspaceMember.Role.OWNER


class IsWorkspaceDeveloperOrAbove(BasePermission):
    """Allow Owner, Manager or Developer — block Viewer."""
    message = 'Viewers cannot perform this action.'

    def has_object_permission(self, request, view, obj):
        member = get_member(obj, request.user)
        if not member:
            return False
        return member.role in [
            WorkspaceMember.Role.OWNER,
            WorkspaceMember.Role.MANAGER,
            WorkspaceMember.Role.DEVELOPER,
        ]
