"""
Shared pytest fixtures
tests/conftest.py
"""
import pytest
from rest_framework.test import APIClient


@pytest.fixture(autouse=True)
def disable_html_render(settings):
    """Disable HTML rendering for tests to avoid Python 3.14 template issues."""
    settings.DEBUG = False
    settings.REST_FRAMEWORK = {
        'DEFAULT_AUTHENTICATION_CLASSES': (
            'rest_framework_simplejwt.authentication.JWTAuthentication',
        ),
        'DEFAULT_PERMISSION_CLASSES': (
            'rest_framework.permissions.AllowAny',
        ),
        'DEFAULT_RENDERER_CLASSES': (
            'rest_framework.renderers.JSONRenderer',
        ),
    }

@pytest.fixture
def api_client():
    """Return an unauthenticated API client."""
    return APIClient()


@pytest.fixture
def authenticated_client(api_client, create_user):
    """Return an authenticated API client."""
    user = create_user()
    api_client.force_authenticate(user=user)
    return api_client, user


@pytest.fixture
def create_user(db):
    """Factory fixture to create users."""
    from apps.accounts.models import User

    def make_user(
        email='test@example.com',
        password='testpass123',
        first_name='Test',
        last_name='User',
    ):
        return User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )
    return make_user
