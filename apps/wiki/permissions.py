from rest_framework import permissions

class IsEditorOrOwner(permissions.BasePermission):
    """Allow access if user is editor role or the owner of the object.

    Safe methods (GET, HEAD, OPTIONS) are allowed for any authenticated user.
    Write methods (POST, PUT, PATCH, DELETE) are allowed only if:
        * user.role is one of allowed editor roles (e.g., 'admin', 'manager', 'editor')
        * OR the user is the author of the WikiArticle.
    Adjust role names according to your User model.
    """

    editor_roles = {"admin", "manager", "editor"}

    def has_permission(self, request, view):
        # Allow any safe method for authenticated users
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        # For write ops, defer to object-level permission
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Safe methods already handled
        if request.method in permissions.SAFE_METHODS:
            return True
        # Check role
        if getattr(request.user, "role", "").lower() in self.editor_roles:
            return True
        # Check ownership (obj may be WikiArticle or WikiRevision)
        author = getattr(obj, "author", None)
        if author:
            return author.id == request.user.id
        return False
