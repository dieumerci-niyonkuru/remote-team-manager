from functools import wraps
from rest_framework.response import Response
from rest_framework import status
from apps.accounts.models import User


def role_required(*allowed_roles):
    """Decorator for DRF view methods – checks request.user.role against allowed_roles."""
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(self, request, *args, **kwargs):
            user: User = request.user
            if not user.is_authenticated:
                return Response({"detail": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
            if user.role not in allowed_roles:
                return Response({"detail": "Permission denied"}, status=status.HTTP_403_FORBIDDEN)
            return view_func(self, request, *args, **kwargs)
        return _wrapped_view
    return decorator


def workspace_owner_required(view_func):
    """Ensures the user is the owner of the workspace referenced by `workspace` in data or URL kwarg `pk`."""
    @wraps(view_func)
    def _wrapped(self, request, *args, **kwargs):
        workspace_id = request.data.get("workspace") or kwargs.get("pk")
        if not workspace_id:
            return Response({"detail": "Workspace identifier missing"}, status=status.HTTP_400_BAD_REQUEST)
        from apps.workspaces.models import Workspace
        try:
            ws = Workspace.objects.get(id=workspace_id)
        except Workspace.DoesNotExist:
            return Response({"detail": "Workspace not found"}, status=status.HTTP_404_NOT_FOUND)
        if ws.created_by != request.user:
            return Response({"detail": "Only the workspace owner may perform this action"}, status=status.HTTP_403_FORBIDDEN)
        return view_func(self, request, *args, **kwargs)
    return _wrapped
