import pytest
from rest_framework.test import APIClient
from apps.users.models import User
from apps.workspaces.models import Workspace, WorkspaceMember


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def create_user(db):
    def make(email='user@test.com', password='Test1234x'):
        return User.objects.create_user(
            email=email, password=password,
            first_name='Test', last_name='User'
        )
    return make


@pytest.mark.django_db
class TestAuthEndpoints:

    def test_register_returns_201(self, client):
        res = client.post('/api/auth/register/', {
            'email': 'new@test.com',
            'first_name': 'John',
            'last_name': 'Doe',
            'password': 'Test1234x',
            'password2': 'Test1234x',
        })
        assert res.status_code == 201
        assert res.data['data']['user']['email'] == 'new@test.com'
        assert 'access' in res.data['data']

    def test_login_returns_200(self, client, create_user):
        create_user(email='login@test.com')
        res = client.post('/api/auth/login/', {
            'email': 'login@test.com',
            'password': 'Test1234x',
        })
        assert res.status_code == 200
        assert res.data['message'] == 'Login successful.'

    def test_login_wrong_password_returns_401(self, client, create_user):
        create_user(email='fail@test.com')
        res = client.post('/api/auth/login/', {
            'email': 'fail@test.com',
            'password': 'wrongpassword',
        })
        assert res.status_code == 401

    def test_me_requires_auth(self, client):
        res = client.get('/api/auth/me/')
        assert res.status_code == 401


@pytest.mark.django_db
class TestWorkspaceEndpoints:

    def setup_method(self):
        self.client = APIClient()
        self.owner = User.objects.create_user(
            email='owner@test.com', password='Test1234x',
            first_name='Owner', last_name='User'
        )
        self.other = User.objects.create_user(
            email='other@test.com', password='Test1234x',
            first_name='Other', last_name='User'
        )
        self.client.force_authenticate(user=self.owner)

    def test_create_workspace_returns_201(self):
        res = self.client.post('/api/workspaces/', {
            'name': 'My Workspace',
            'description': 'Test workspace'
        })
        assert res.status_code == 201
        assert res.data['data']['name'] == 'My Workspace'

    def test_list_workspaces_returns_200(self):
        res = self.client.get('/api/workspaces/')
        assert res.status_code == 200

    def test_unauthenticated_cannot_create_workspace(self):
        client = APIClient()
        res = client.post('/api/workspaces/', {'name': 'Test'})
        assert res.status_code == 401

    def test_non_member_cannot_access_workspace(self):
        workspace = Workspace.objects.create(
            name='Private', owner=self.owner
        )
        WorkspaceMember.objects.create(
            workspace=workspace, user=self.owner,
            role=WorkspaceMember.Role.OWNER
        )
        self.client.force_authenticate(user=self.other)
        res = self.client.get(f'/api/workspaces/{workspace.id}/')
        assert res.status_code == 403

    def test_viewer_cannot_delete_workspace(self):
        workspace = Workspace.objects.create(
            name='Test WS', owner=self.owner
        )
        WorkspaceMember.objects.create(
            workspace=workspace, user=self.owner,
            role=WorkspaceMember.Role.OWNER
        )
        WorkspaceMember.objects.create(
            workspace=workspace, user=self.other,
            role=WorkspaceMember.Role.VIEWER
        )
        self.client.force_authenticate(user=self.other)
        res = self.client.delete(f'/api/workspaces/{workspace.id}/')
        assert res.status_code == 403
