"""
Shared pytest fixtures
tests/conftest.py
"""
import pytest
from rest_framework.test import APIClient


@pytest.fixture(autouse=True)
def disable_html_render(settings):
    """Force JSON-only rendering and custom exception handler for all tests."""
    settings.DEBUG = False

    # Remove RateLimitMiddleware so register/login tests don't hit the
    # 3-req/5-min IP cap — all test files share the same IP (127.0.0.1)
    # and the same Redis cache, so the counter accumulates across test classes.
    settings.MIDDLEWARE = [
        m for m in settings.MIDDLEWARE
        if m != 'apps.auth.rate_limit.RateLimitMiddleware'
    ]

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
        # Keep the custom handler active in tests so behaviour matches production
        'EXCEPTION_HANDLER': 'config.exception_handler.custom_exception_handler',
    }
    # Use in-memory channel layer so tests don't need a running Redis server
    settings.CHANNEL_LAYERS = {
        "default": {
            "BACKEND": "channels.layers.InMemoryChannelLayer"
        }
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
