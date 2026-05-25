"""
Custom authentication backend that allows login with email or username.
apps/accounts/backends.py
"""
from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model

User = get_user_model()


class EmailOrUsernameBackend(ModelBackend):
    """
    Authenticate using either email or username.
    """

    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None or password is None:
            return None

        # Try to find user by email first, then by username
        user = None
        try:
            user = User.objects.get(email=username)
        except User.DoesNotExist:
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                return None

        if user and user.check_password(password) and self.user_can_authenticate(user):
            return user

        return None
