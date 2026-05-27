"""
Smoke tests — quick sanity checks that core endpoints behave correctly.
These run in CI against a real PostgreSQL + Redis stack (GitHub Actions services).

Coverage goals:
  - Health endpoints (no auth required)
  - Auth endpoints return correct error codes for bad input
  - Protected endpoints reject unauthenticated requests
  - Model layer: User creation works
  - Authenticated API: profile + workspace list
"""
import pytest


# ── Health checks ──────────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_health_endpoint_returns_200(client):
    """Health endpoint must return 200 when the database is reachable."""
    response = client.get('/api/health/')
    assert response.status_code == 200
    data = response.json()
    assert 'status' in data
    assert 'checks' in data
    assert data['checks']['database'] == 'ok'


@pytest.mark.django_db
def test_health_extended_returns_200(client):
    """Extended health endpoint must always return 200 (even if degraded)."""
    response = client.get('/api/health/extended/')
    assert response.status_code == 200
    data = response.json()
    assert 'status' in data
    assert 'checks' in data
    assert data['checks']['db'] == 'ok'


# ── Auth — error handling ──────────────────────────────────────────────────────

def test_login_with_wrong_credentials_returns_401(client):
    """Login with non-existent credentials must return 401."""
    response = client.post(
        '/api/auth/login/',
        {'email': 'nobody@example.com', 'password': 'wrongpassword'},
        content_type='application/json',
    )
    assert response.status_code in (400, 401)


def test_login_with_empty_body_returns_400(client):
    """Login with empty body must return 400."""
    response = client.post('/api/auth/login/', {}, content_type='application/json')
    assert response.status_code in (400, 401)


def test_register_with_empty_body_returns_400(client):
    """Register with no fields must return 400 validation error."""
    response = client.post('/api/auth/register/', {}, content_type='application/json')
    assert response.status_code == 400


def test_register_with_mismatched_passwords_returns_400(client):
    """Register with mismatched passwords must return 400."""
    response = client.post(
        '/api/auth/register/',
        {
            'email': 'new@example.com',
            'password': 'StrongPass123!',
            'password2': 'DifferentPass456!',
            'first_name': 'Test',
            'last_name': 'User',
        },
        content_type='application/json',
    )
    assert response.status_code == 400


def test_token_refresh_with_empty_body_returns_400(client):
    """Token refresh without a refresh token must return 400."""
    response = client.post('/api/auth/token/refresh/', {}, content_type='application/json')
    assert response.status_code == 400


# ── Protected endpoints — unauthenticated access ───────────────────────────────

def test_workspace_list_requires_auth(client):
    """Workspace list must reject unauthenticated requests (401)."""
    response = client.get('/api/workspaces/')
    assert response.status_code in (401, 403)


def test_projects_list_requires_auth(client):
    """Project list must reject unauthenticated requests (401)."""
    response = client.get('/api/projects/')
    assert response.status_code in (401, 403)


def test_user_profile_requires_auth(client):
    """Profile endpoint must reject unauthenticated requests (401)."""
    response = client.get('/api/auth/me/')
    assert response.status_code in (401, 403)


# ── Model layer ────────────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_create_user_succeeds(create_user):
    """User factory fixture must create a valid, active user."""
    user = create_user(email='smoke@example.com')
    assert user.pk is not None
    assert user.email == 'smoke@example.com'
    assert user.is_active
    assert user.check_password('testpass123')


@pytest.mark.django_db
def test_create_two_users_with_different_emails(create_user):
    """Two users with different emails must coexist without integrity errors."""
    u1 = create_user(email='user1@example.com')
    u2 = create_user(email='user2@example.com')
    assert u1.pk != u2.pk
    assert u1.email != u2.email


# ── Authenticated API ──────────────────────────────────────────────────────────

@pytest.mark.django_db
def test_authenticated_user_can_get_profile(api_client, create_user):
    """Authenticated users must receive their own profile at /api/auth/me/."""
    user = create_user(email='profile@example.com')
    api_client.force_authenticate(user=user)
    response = api_client.get('/api/auth/me/')
    assert response.status_code == 200
    data = response.json()
    assert data.get('email') == 'profile@example.com'


@pytest.mark.django_db
def test_authenticated_user_can_list_workspaces(api_client, create_user):
    """Authenticated users must receive 200 on workspace list (empty list is fine)."""
    user = create_user(email='ws@example.com')
    api_client.force_authenticate(user=user)
    response = api_client.get('/api/workspaces/')
    assert response.status_code == 200
    body = response.json()
    # Response may be wrapped: {data: [...], message: ...} or a plain list
    workspace_list = body.get('data', body) if isinstance(body, dict) else body
    assert isinstance(workspace_list, list)


@pytest.mark.django_db
def test_register_new_user_returns_201(client):
    """Registering a valid new user must return 201 with tokens."""
    response = client.post(
        '/api/auth/register/',
        {
            'email': 'newuser@example.com',
            'password': 'StrongPass123!',
            'password2': 'StrongPass123!',
            'first_name': 'New',
            'last_name': 'User',
        },
        content_type='application/json',
    )
    assert response.status_code == 201
    data = response.json()
    # Should return tokens inside data envelope
    user_data = data.get('data', data)
    assert 'access' in user_data
    assert 'refresh' in user_data
