from rest_framework.permissions import BasePermission
from .models import WorkspaceMember


def get_member(workspace, user):
    try:
        return WorkspaceMember.objects.get(workspace=workspace, user=user)
    except WorkspaceMember.DoesNotExist:
        return None


class IsWorkspaceMember(BasePermission):
    def has_object_permission(self, request, view, obj):
        return get_member(obj, request.user) is not None


class IsWorkspaceManager(BasePermission):
    def has_object_permission(self, request, view, obj):
        member = get_member(obj, request.user)
        if not member:
            return False
        return member.role in [WorkspaceMember.Role.OWNER, WorkspaceMember.Role.MANAGER]


class IsWorkspaceOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        member = get_member(obj, request.user)
        if not member:
            return False
        return member.role == WorkspaceMember.Role.OWNER
