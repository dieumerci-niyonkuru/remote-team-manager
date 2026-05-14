from rest_framework import permissions

class IsWorkspaceMember(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        return obj.workspacemember_set.filter(user=request.user).exists()

class HasWorkspaceRole(permissions.BasePermission):
    def __init__(self, allowed_roles):
        self.allowed_roles = allowed_roles

    def has_object_permission(self, request, view, obj):
        try:
            member = obj.workspacemember_set.get(user=request.user)
            return member.role in self.allowed_roles
        except:
            return False
