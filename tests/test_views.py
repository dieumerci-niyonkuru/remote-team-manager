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


@pytest.mark.django_db
class TestSubtaskAndProgress:

    def setup_method(self):
        from apps.projects.models import Project
        from apps.tasks.models import Task
        self.client = APIClient()
        self.owner  = User.objects.create_user(
            email='subowner@test.com', password='Test1234x',
            first_name='Owner', last_name='User'
        )
        self.workspace = Workspace.objects.create(
            name='Sub WS', owner=self.owner
        )
        WorkspaceMember.objects.create(
            workspace=self.workspace, user=self.owner,
            role=WorkspaceMember.Role.OWNER
        )
        self.project = Project.objects.create(
            name='Sub Project',
            workspace=self.workspace,
            created_by=self.owner
        )
        self.task = Task.objects.create(
            project=self.project,
            title='Parent Task',
            created_by=self.owner
        )
        self.client.force_authenticate(user=self.owner)
        self.base_url = (
            f'/api/workspaces/{self.workspace.id}'
            f'/projects/{self.project.id}'
            f'/tasks/{self.task.id}/subtasks/'
        )

    def test_create_subtask_returns_201(self):
        res = self.client.post(self.base_url, {'title': 'Step 1'})
        assert res.status_code == 201
        assert res.data['data']['title'] == 'Step 1'
        assert res.data['data']['is_completed'] == False

    def test_list_subtasks_returns_200(self):
        res = self.client.get(self.base_url)
        assert res.status_code == 200

    def test_complete_subtask_updates_progress(self):
        from apps.tasks.models import Subtask, Task
        s1 = Subtask.objects.create(task=self.task, title='Step 1')
        s2 = Subtask.objects.create(task=self.task, title='Step 2')
        s3 = Subtask.objects.create(task=self.task, title='Step 3')
        s4 = Subtask.objects.create(task=self.task, title='Step 4')

        # Complete 2 out of 4 = 50%
        url = f'{self.base_url}{s1.id}/'
        self.client.patch(url, {'is_completed': True})
        url = f'{self.base_url}{s2.id}/'
        self.client.patch(url, {'is_completed': True})

        self.task.refresh_from_db()
        assert self.task.progress == 50

    def test_all_subtasks_done_progress_is_100(self):
        from apps.tasks.models import Subtask, Task
        s1 = Subtask.objects.create(task=self.task, title='Step 1')
        s2 = Subtask.objects.create(task=self.task, title='Step 2')

        self.client.patch(f'{self.base_url}{s1.id}/', {'is_completed': True})
        self.client.patch(f'{self.base_url}{s2.id}/', {'is_completed': True})

        self.task.refresh_from_db()
        assert self.task.progress == 100

    def test_no_subtasks_progress_stays_zero(self):
        self.task.refresh_from_db()
        assert self.task.progress == 0

    def test_delete_subtask_updates_progress(self):
        from apps.tasks.models import Subtask
        s1 = Subtask.objects.create(task=self.task, title='Step 1', is_completed=True)
        s2 = Subtask.objects.create(task=self.task, title='Step 2', is_completed=False)

        self.task.update_progress()
        self.task.refresh_from_db()
        assert self.task.progress == 50

        # Delete the incomplete one — now 1/1 = 100%
        self.client.delete(f'{self.base_url}{s2.id}/')
        self.task.refresh_from_db()
        assert self.task.progress == 100

    def test_viewer_cannot_create_subtask(self):
        viewer = User.objects.create_user(
            email='subviewer@test.com', password='Test1234x',
            first_name='Viewer', last_name='User'
        )
        WorkspaceMember.objects.create(
            workspace=self.workspace, user=viewer,
            role=WorkspaceMember.Role.VIEWER
        )
        self.client.force_authenticate(user=viewer)
        res = self.client.post(self.base_url, {'title': 'Viewer Subtask'})
        assert res.status_code == 403


@pytest.mark.django_db
class TestTaskFilters:

    def setup_method(self):
        from apps.projects.models import Project
        from apps.tasks.models import Task
        import datetime
        self.client = APIClient()
        self.owner  = User.objects.create_user(
            email='filterowner@test.com', password='Test1234x',
            first_name='Filter', last_name='Owner'
        )
        self.developer = User.objects.create_user(
            email='filterdev@test.com', password='Test1234x',
            first_name='Filter', last_name='Dev'
        )
        self.workspace = Workspace.objects.create(
            name='Filter WS', owner=self.owner
        )
        WorkspaceMember.objects.create(
            workspace=self.workspace, user=self.owner,
            role=WorkspaceMember.Role.OWNER
        )
        WorkspaceMember.objects.create(
            workspace=self.workspace, user=self.developer,
            role=WorkspaceMember.Role.DEVELOPER
        )
        self.project = Project.objects.create(
            name='Filter Project',
            workspace=self.workspace,
            created_by=self.owner
        )
        # Create tasks with different status/priority/assignee
        Task.objects.create(
            project=self.project, title='Todo Low',
            status='todo', priority='low',
            created_by=self.owner
        )
        Task.objects.create(
            project=self.project, title='In Progress High',
            status='in_progress', priority='high',
            assignee=self.developer, created_by=self.owner
        )
        Task.objects.create(
            project=self.project, title='Done Medium',
            status='done', priority='medium',
            created_by=self.owner,
            due_date=datetime.date(2026, 12, 31)
        )
        self.client.force_authenticate(user=self.owner)
        self.base_url = (
            f'/api/workspaces/{self.workspace.id}'
            f'/projects/{self.project.id}/tasks/'
        )

    def test_filter_by_status_todo(self):
        res = self.client.get(f'{self.base_url}?status=todo')
        assert res.status_code == 200
        assert len(res.data['data']) == 1
        assert res.data['data'][0]['title'] == 'Todo Low'

    def test_filter_by_status_done(self):
        res = self.client.get(f'{self.base_url}?status=done')
        assert res.status_code == 200
        assert all(t['status'] == 'done' for t in res.data['data'])

    def test_filter_by_priority_high(self):
        res = self.client.get(f'{self.base_url}?priority=high')
        assert res.status_code == 200
        assert len(res.data['data']) == 1
        assert res.data['data'][0]['title'] == 'In Progress High'

    def test_filter_by_assignee(self):
        res = self.client.get(f'{self.base_url}?assignee={self.developer.id}')
        assert res.status_code == 200
        assert len(res.data['data']) == 1
        assert res.data['data'][0]['title'] == 'In Progress High'

    def test_filter_by_due_date(self):
        res = self.client.get(f'{self.base_url}?due_date=2026-12-31')
        assert res.status_code == 200
        assert len(res.data['data']) == 1
        assert res.data['data'][0]['title'] == 'Done Medium'

    def test_no_filter_returns_all_tasks(self):
        res = self.client.get(self.base_url)
        assert res.status_code == 200
        assert len(res.data['data']) == 3

    def test_filter_by_status_in_progress(self):
        res = self.client.get(f'{self.base_url}?status=in_progress')
        assert res.status_code == 200
        assert len(res.data['data']) == 1
        assert res.data['data'][0]['priority'] == 'high'


@pytest.mark.django_db
class TestTimeLogEndpoints:

    def setup_method(self):
        from apps.projects.models import Project
        from apps.tasks.models import Task
        import datetime
        self.client    = APIClient()
        self.owner     = User.objects.create_user(
            email='logowner@test.com', password='Test1234x',
            first_name='Log', last_name='Owner'
        )
        self.manager   = User.objects.create_user(
            email='logmgr@test.com', password='Test1234x',
            first_name='Log', last_name='Manager'
        )
        self.developer = User.objects.create_user(
            email='logdev@test.com', password='Test1234x',
            first_name='Log', last_name='Dev'
        )
        self.workspace = Workspace.objects.create(
            name='Log WS', owner=self.owner
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
        self.project = Project.objects.create(
            name='Log Project',
            workspace=self.workspace,
            created_by=self.owner
        )
        self.task = Task.objects.create(
            project=self.project,
            title='Loggable Task',
            created_by=self.owner
        )
        self.base_url = (
            f'/api/workspaces/{self.workspace.id}'
            f'/projects/{self.project.id}'
            f'/tasks/{self.task.id}/timelogs/'
        )

    def test_member_can_log_time(self):
        self.client.force_authenticate(user=self.developer)
        res = self.client.post(self.base_url, {
            'hours': '2.50',
            'description': 'Worked on feature',
            'logged_at': '2026-04-26',
        })
        assert res.status_code == 201
        assert float(res.data['data']['hours']) == 2.50

    def test_developer_sees_only_own_logs(self):
        from apps.tasks.models import TimeLog
        import datetime
        TimeLog.objects.create(
            task=self.task, user=self.owner,
            hours=3, logged_at=datetime.date.today()
        )
        TimeLog.objects.create(
            task=self.task, user=self.developer,
            hours=2, logged_at=datetime.date.today()
        )
        self.client.force_authenticate(user=self.developer)
        res = self.client.get(self.base_url)
        assert res.status_code == 200
        assert len(res.data['data']) == 1

    def test_manager_sees_all_logs(self):
        from apps.tasks.models import TimeLog
        import datetime
        TimeLog.objects.create(
            task=self.task, user=self.owner,
            hours=3, logged_at=datetime.date.today()
        )
        TimeLog.objects.create(
            task=self.task, user=self.developer,
            hours=2, logged_at=datetime.date.today()
        )
        self.client.force_authenticate(user=self.manager)
        res = self.client.get(self.base_url)
        assert res.status_code == 200
        assert len(res.data['data']) == 2

    def test_owner_sees_all_logs(self):
        from apps.tasks.models import TimeLog
        import datetime
        TimeLog.objects.create(
            task=self.task, user=self.developer,
            hours=1, logged_at=datetime.date.today()
        )
        self.client.force_authenticate(user=self.owner)
        res = self.client.get(self.base_url)
        assert res.status_code == 200
        assert len(res.data['data']) == 1

    def test_outsider_cannot_log_time(self):
        outsider = User.objects.create_user(
            email='logout@test.com', password='Test1234x',
            first_name='Out', last_name='Sider'
        )
        self.client.force_authenticate(user=outsider)
        res = self.client.post(self.base_url, {
            'hours': '1.00',
            'logged_at': '2026-04-26',
        })
        assert res.status_code == 403


@pytest.mark.django_db
class TestActivityFeed:

    def setup_method(self):
        from apps.projects.models import Project
        self.client = APIClient()
        self.owner  = User.objects.create_user(
            email='actowner@test.com', password='Test1234x',
            first_name='Act', last_name='Owner'
        )
        self.workspace = Workspace.objects.create(
            name='Act WS', owner=self.owner
        )
        WorkspaceMember.objects.create(
            workspace=self.workspace, user=self.owner,
            role=WorkspaceMember.Role.OWNER
        )
        self.project = Project.objects.create(
            name='Act Project',
            workspace=self.workspace,
            created_by=self.owner
        )
        self.client.force_authenticate(user=self.owner)
        self.feed_url = f'/api/workspaces/{self.workspace.id}/activity/'

    def test_activity_feed_returns_200(self):
        res = self.client.get(self.feed_url)
        assert res.status_code == 200

    def test_creating_task_logs_activity(self):
        from apps.tasks.models import ActivityFeed
        task_url = (
            f'/api/workspaces/{self.workspace.id}'
            f'/projects/{self.project.id}/tasks/'
        )
        self.client.post(task_url, {
            'title': 'Logged Task',
            'status': 'todo',
            'priority': 'medium',
        })
        count = ActivityFeed.objects.filter(
            workspace=self.workspace,
            action='created'
        ).count()
        assert count >= 1

    def test_outsider_cannot_see_activity(self):
        outsider = User.objects.create_user(
            email='actout@test.com', password='Test1234x',
            first_name='Out', last_name='Sider'
        )
        self.client.force_authenticate(user=outsider)
        res = self.client.get(self.feed_url)
        assert res.status_code == 403

    def test_activity_feed_has_correct_fields(self):
        from apps.tasks.models import ActivityFeed
        ActivityFeed.objects.create(
            workspace=self.workspace,
            actor=self.owner,
            action='created',
            object_type='task',
            object_id=self.workspace.id,
            object_name='Test Task'
        )
        res = self.client.get(self.feed_url)
        assert res.status_code == 200
        item = res.data['data'][0]
        assert 'actor' in item
        assert 'action' in item
        assert 'object_type' in item
        assert 'timestamp' in item
