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


@pytest.mark.django_db
class TestProjectEndpoints:

    def setup_method(self):
        self.client = APIClient()
        self.owner = User.objects.create_user(
            email='projowner@test.com', password='Test1234x',
            first_name='Owner', last_name='User'
        )
        self.developer = User.objects.create_user(
            email='projdev@test.com', password='Test1234x',
            first_name='Dev', last_name='User'
        )
        self.workspace = Workspace.objects.create(
            name='Project WS', owner=self.owner
        )
        WorkspaceMember.objects.create(
            workspace=self.workspace, user=self.owner,
            role=WorkspaceMember.Role.OWNER
        )
        WorkspaceMember.objects.create(
            workspace=self.workspace, user=self.developer,
            role=WorkspaceMember.Role.DEVELOPER
        )
        self.client.force_authenticate(user=self.owner)

    def test_owner_can_create_project(self):
        res = self.client.post(
            f'/api/workspaces/{self.workspace.id}/projects/',
            {'name': 'My Project', 'description': 'Test'}
        )
        assert res.status_code == 201
        assert res.data['data']['name'] == 'My Project'

    def test_developer_cannot_create_project(self):
        self.client.force_authenticate(user=self.developer)
        res = self.client.post(
            f'/api/workspaces/{self.workspace.id}/projects/',
            {'name': 'Dev Project'}
        )
        assert res.status_code == 403

    def test_member_can_list_projects(self):
        self.client.force_authenticate(user=self.developer)
        res = self.client.get(
            f'/api/workspaces/{self.workspace.id}/projects/'
        )
        assert res.status_code == 200

    def test_outsider_cannot_list_projects(self):
        outsider = User.objects.create_user(
            email='outsider2@test.com', password='Test1234x',
            first_name='Out', last_name='Sider'
        )
        self.client.force_authenticate(user=outsider)
        res = self.client.get(
            f'/api/workspaces/{self.workspace.id}/projects/'
        )
        assert res.status_code == 403


@pytest.mark.django_db
class TestTaskEndpoints:

    def setup_method(self):
        from apps.projects.models import Project
        self.client    = APIClient()
        self.owner     = User.objects.create_user(
            email='taskowner@test.com', password='Test1234x',
            first_name='Owner', last_name='User'
        )
        self.manager   = User.objects.create_user(
            email='taskmgr@test.com', password='Test1234x',
            first_name='Manager', last_name='User'
        )
        self.developer = User.objects.create_user(
            email='taskdev@test.com', password='Test1234x',
            first_name='Dev', last_name='User'
        )
        self.viewer    = User.objects.create_user(
            email='taskviewer@test.com', password='Test1234x',
            first_name='Viewer', last_name='User'
        )
        self.workspace = Workspace.objects.create(
            name='Task WS', owner=self.owner
        )
        WorkspaceMember.objects.create(
            workspace=self.workspace, user=self.owner,
            role=WorkspaceMember.Role.OWNER
        )
        WorkspaceMember.objects.create(
            workspace=self.workspace, user=self.manager,
            role=WorkspaceMember.Role.MANAGER
        )
        WorkspaceMember.objects.create(
            workspace=self.workspace, user=self.developer,
            role=WorkspaceMember.Role.DEVELOPER
        )
        WorkspaceMember.objects.create(
            workspace=self.workspace, user=self.viewer,
            role=WorkspaceMember.Role.VIEWER
        )
        self.project = Project.objects.create(
            name='Task Project',
            workspace=self.workspace,
            created_by=self.owner
        )
        self.base_url = f'/api/workspaces/{self.workspace.id}/projects/{self.project.id}/tasks/'

    def test_developer_can_create_task(self):
        self.client.force_authenticate(user=self.developer)
        res = self.client.post(self.base_url, {
            'title': 'Dev Task',
            'status': 'todo',
            'priority': 'medium',
        })
        assert res.status_code == 201
        assert res.data['data']['title'] == 'Dev Task'

    def test_viewer_cannot_create_task(self):
        self.client.force_authenticate(user=self.viewer)
        res = self.client.post(self.base_url, {
            'title': 'Viewer Task',
            'status': 'todo',
        })
        assert res.status_code == 403

    def test_any_member_can_list_tasks(self):
        self.client.force_authenticate(user=self.viewer)
        res = self.client.get(self.base_url)
        assert res.status_code == 200

    def test_manager_can_delete_task(self):
        from apps.tasks.models import Task
        task = Task.objects.create(
            project=self.project,
            title='Delete Me',
            created_by=self.owner
        )
        self.client.force_authenticate(user=self.manager)
        res = self.client.delete(f'{self.base_url}{task.id}/')
        assert res.status_code == 200

    def test_developer_cannot_delete_task(self):
        from apps.tasks.models import Task
        task = Task.objects.create(
            project=self.project,
            title='Cant Delete',
            created_by=self.owner
        )
        self.client.force_authenticate(user=self.developer)
        res = self.client.delete(f'{self.base_url}{task.id}/')
        assert res.status_code == 403

    def test_viewer_cannot_delete_task(self):
        from apps.tasks.models import Task
        task = Task.objects.create(
            project=self.project,
            title='Viewer Cant Delete',
            created_by=self.owner
        )
        self.client.force_authenticate(user=self.viewer)
        res = self.client.delete(f'{self.base_url}{task.id}/')
        assert res.status_code == 403

    def test_task_filter_by_status(self):
        from apps.tasks.models import Task
        Task.objects.create(
            project=self.project, title='Todo Task',
            status='todo', created_by=self.owner
        )
        Task.objects.create(
            project=self.project, title='Done Task',
            status='done', created_by=self.owner
        )
        self.client.force_authenticate(user=self.owner)
        res = self.client.get(f'{self.base_url}?status=todo')
        assert res.status_code == 200
        assert all(t['status'] == 'todo' for t in res.data['data'])

    def test_task_filter_by_priority(self):
        from apps.tasks.models import Task
        Task.objects.create(
            project=self.project, title='High Task',
            priority='high', created_by=self.owner
        )
        self.client.force_authenticate(user=self.owner)
        res = self.client.get(f'{self.base_url}?priority=high')
        assert res.status_code == 200
        assert all(t['priority'] == 'high' for t in res.data['data'])

    def test_outsider_cannot_access_tasks(self):
        outsider = User.objects.create_user(
            email='taskout@test.com', password='Test1234x',
            first_name='Out', last_name='Sider'
        )
        self.client.force_authenticate(user=outsider)
        res = self.client.get(self.base_url)
        assert res.status_code == 403
