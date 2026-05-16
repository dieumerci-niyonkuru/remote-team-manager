import pytest
from rest_framework.test import APIClient
from apps.accounts.models import User
from apps.workspaces.models import Workspace, WorkspaceMember


@pytest.fixture
def client():
    return APIClient()


@pytest.fixture
def create_user(db):
    def make(email='user@test.com', password='Test1234x'):
        return User.objects.create_user(
            username=email, email=email, password=password,
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
        assert 'Login successful.' in res.data['message']

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
            username='owner@test.com', email='owner@test.com', password='Test1234x',
            first_name='Owner', last_name='User'
        )
        self.other = User.objects.create_user(
            username='other@test.com', email='other@test.com', password='Test1234x',
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
            name='Private', created_by=self.owner
        )
        WorkspaceMember.objects.create(
            workspace=workspace, user=self.owner,
            role='owner'
        )
        outsider = User.objects.create_user(username='outsider@test.com', email='outsider@test.com', password='Test1234x')
        self.client.force_authenticate(user=outsider)
        res = self.client.get(f'/api/workspaces/{workspace.id}/')
        assert res.status_code == 404

    def test_viewer_cannot_delete_workspace(self):
        workspace = Workspace.objects.create(
            name='Test WS', created_by=self.owner
        )
        WorkspaceMember.objects.create(
            workspace=workspace, user=self.owner,
            role='owner'
        )
        WorkspaceMember.objects.create(
            workspace=workspace, user=self.other,
            role='viewer'
        )
        self.client.force_authenticate(user=self.other)
        res = self.client.delete(f'/api/workspaces/{workspace.id}/')
        assert res.status_code == 403


@pytest.mark.django_db
class TestProjectEndpoints:

    def setup_method(self):
        self.client = APIClient()
        self.owner = User.objects.create_user(
            username='projowner@test.com', email='projowner@test.com', password='Test1234x',
            first_name='Owner', last_name='User'
        )
        self.developer = User.objects.create_user(
            username='projdev@test.com', email='projdev@test.com', password='Test1234x',
            first_name='Dev', last_name='User'
        )
        self.workspace = Workspace.objects.create(
            name='Project WS', created_by=self.owner
        )
        WorkspaceMember.objects.create(
            workspace=self.workspace, user=self.owner,
            role='owner'
        )
        WorkspaceMember.objects.create(
            workspace=self.workspace, user=self.developer,
            role='developer'
        )
        self.client.force_authenticate(user=self.owner)

    def test_owner_can_create_project(self):
        res = self.client.post(
            '/api/projects/',
            {'name': 'My Project', 'description': 'Test', 'workspace': self.workspace.id}
        )
        assert res.status_code == 201
        assert res.data['data']['name'] == 'My Project'

    def test_developer_cannot_create_project(self):
        self.client.force_authenticate(user=self.developer)
        res = self.client.post(
            '/api/projects/',
            {'name': 'Dev Project', 'workspace': self.workspace.id}
        )
        assert res.status_code == 403

    def test_member_can_list_projects(self):
        self.client.force_authenticate(user=self.developer)
        res = self.client.get(
            f'/api/projects/?workspace={self.workspace.id}'
        )
        assert res.status_code == 200
        assert len(res.data['data']) >= 0

    def test_outsider_cannot_list_projects(self):
        outsider = User.objects.create_user(
            username='outsider2@test.com', email='outsider2@test.com', password='Test1234x',
            first_name='Out', last_name='Sider'
        )
        self.client.force_authenticate(user=outsider)
        res = self.client.get(
            f'/api/projects/?workspace={self.workspace.id}'
        )
        assert res.status_code == 200
        assert len(res.data['data']) == 0


@pytest.mark.django_db
class TestTaskEndpoints:

    def setup_method(self):
        from apps.projects.models import Project
        self.client    = APIClient()
        self.owner     = User.objects.create_user(
            username='taskowner@test.com', email='taskowner@test.com', password='Test1234x',
            first_name='Owner', last_name='User'
        )
        self.manager   = User.objects.create_user(
            username='taskmgr@test.com', email='taskmgr@test.com', password='Test1234x',
            first_name='Manager', last_name='User'
        )
        self.developer = User.objects.create_user(
            username='taskdev@test.com', email='taskdev@test.com', password='Test1234x',
            first_name='Dev', last_name='User'
        )
        self.viewer    = User.objects.create_user(
            username='taskviewer@test.com', email='taskviewer@test.com', password='Test1234x',
            first_name='Viewer', last_name='User'
        )
        self.workspace = Workspace.objects.create(
            name='Task WS', created_by=self.owner
        )
        WorkspaceMember.objects.create(
            workspace=self.workspace, user=self.owner,
            role='owner'
        )
        WorkspaceMember.objects.create(
            workspace=self.workspace, user=self.manager,
            role='manager'
        )
        WorkspaceMember.objects.create(
            workspace=self.workspace, user=self.developer,
            role='developer'
        )
        WorkspaceMember.objects.create(
            workspace=self.workspace, user=self.viewer,
            role='viewer'
        )
        self.base_url = '/api/tasks/'
        self.project = Project.objects.create(
            name='Task Project',
            workspace=self.workspace,
            created_by=self.owner
        )

    def test_developer_can_create_task(self):
        self.client.force_authenticate(user=self.developer)
        res = self.client.post(self.base_url, {
            'title': 'Dev Task',
            'status': 'todo',
            'priority': 'medium',
            'project': self.project.id
        })
        assert res.status_code == 201
        assert res.data['data']['title'] == 'Dev Task'

    def test_viewer_cannot_create_task(self):
        self.client.force_authenticate(user=self.viewer)
        res = self.client.post(self.base_url, {
            'title': 'Viewer Task',
            'status': 'todo',
            'project': self.project.id
        })
        assert res.status_code == 403

    def test_any_member_can_list_tasks(self):
        self.client.force_authenticate(user=self.viewer)
        res = self.client.get(f'{self.base_url}?project={self.project.id}')
        assert res.status_code == 200
        assert len(res.data['data']) >= 0

    def test_manager_can_delete_task(self):
        from apps.projects.models import Task
        task = Task.objects.create(
            project=self.project,
            title='Delete Me',
            created_by=self.owner
        )
        self.client.force_authenticate(user=self.manager)
        res = self.client.delete(f'{self.base_url}{task.id}/')
        assert res.status_code == 200

    def test_developer_cannot_delete_task(self):
        from apps.projects.models import Task
        task = Task.objects.create(
            project=self.project,
            title='Cant Delete',
            created_by=self.owner
        )
        self.client.force_authenticate(user=self.developer)
        res = self.client.delete(f'{self.base_url}{task.id}/')
        assert res.status_code == 403

    def test_viewer_cannot_delete_task(self):
        from apps.projects.models import Task
        task = Task.objects.create(
            project=self.project,
            title='Viewer Cant Delete',
            created_by=self.owner
        )
        self.client.force_authenticate(user=self.viewer)
        res = self.client.delete(f'{self.base_url}{task.id}/')
        assert res.status_code == 403

    def test_task_filter_by_status(self):
        from apps.projects.models import Task
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
        from apps.projects.models import Task
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
            username='taskout@test.com', email='taskout@test.com', password='Test1234x',
            first_name='Out', last_name='Sider'
        )
        self.client.force_authenticate(user=outsider)
        res = self.client.get(self.base_url)
        assert res.status_code == 200
        assert len(res.data['data']) == 0


@pytest.mark.django_db
class TestSubtaskAndProgress:

    def setup_method(self):
        from apps.projects.models import Project
        from apps.projects.models import Task
        self.client = APIClient()
        self.owner  = User.objects.create_user(
            username='subowner@test.com', email='subowner@test.com', password='Test1234x',
            first_name='Owner', last_name='User'
        )
        self.workspace = Workspace.objects.create(
            name='Sub WS', created_by=self.owner
        )
        WorkspaceMember.objects.create(
            workspace=self.workspace, user=self.owner,
            role='owner'
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
        self.base_url = f'/api/tasks/{self.task.id}/subtasks/'

    def test_create_subtask_returns_201(self):
        res = self.client.post(self.base_url, {'title': 'Step 1'})
        assert res.status_code == 201
        assert res.data['data']['title'] == 'Step 1'
        assert res.data['data']['is_completed'] == False

    def test_list_subtasks_returns_200(self):
        res = self.client.get(self.base_url)
        assert res.status_code == 200

    def test_complete_subtask_updates_progress(self):
        from apps.projects.models import Subtask
        s1 = Subtask.objects.create(task=self.task, title='Step 1')
        s2 = Subtask.objects.create(task=self.task, title='Step 2')
        # Complete 1 out of 2 = 50%
        self.client.patch(f'/api/subtasks/{s1.id}/', {'is_completed': True})
        self.task.refresh_from_db()
        assert self.task.progress == 50

    def test_all_subtasks_done_progress_is_100(self):
        from apps.projects.models import Subtask
        s1 = Subtask.objects.create(task=self.task, title='Step 1')
        s2 = Subtask.objects.create(task=self.task, title='Step 2')
        self.client.patch(f'/api/subtasks/{s1.id}/', {'is_completed': True})
        self.client.patch(f'/api/subtasks/{s2.id}/', {'is_completed': True})
        self.task.refresh_from_db()
        assert self.task.progress == 100

    def test_delete_subtask_updates_progress(self):
        from apps.projects.models import Subtask
        s1 = Subtask.objects.create(task=self.task, title='Step 1', is_completed=True)
        s2 = Subtask.objects.create(task=self.task, title='Step 2', is_completed=False)
        # Delete the incomplete one — now 1/1 = 100%
        self.client.delete(f'/api/subtasks/{s2.id}/')
        self.task.refresh_from_db()
        assert self.task.progress == 100


    def test_viewer_cannot_create_subtask(self):
        viewer = User.objects.create_user(
            username='subviewer@test.com', email='subviewer@test.com', password='Test1234x',
            first_name='Viewer', last_name='User'
        )
        WorkspaceMember.objects.create(
            workspace=self.workspace, user=viewer,
            role='viewer'
        )
        self.client.force_authenticate(user=viewer)
        res = self.client.post(self.base_url, {'title': 'Viewer Subtask'})
        assert res.status_code == 403


@pytest.mark.django_db
class TestTaskFilters:

    def setup_method(self):
        from apps.projects.models import Project
        from apps.projects.models import Task
        import datetime
        self.client = APIClient()
        self.owner  = User.objects.create_user(
            username='filterowner@test.com', email='filterowner@test.com', password='Test1234x',
            first_name='Filter', last_name='Owner'
        )
        self.developer = User.objects.create_user(
            username='filterdev@test.com', email='filterdev@test.com', password='Test1234x',
            first_name='Filter', last_name='Dev'
        )
        self.workspace = Workspace.objects.create(
            name='Filter WS', created_by=self.owner
        )
        WorkspaceMember.objects.create(
            workspace=self.workspace, user=self.owner,
            role='owner'
        )
        WorkspaceMember.objects.create(
            workspace=self.workspace, user=self.developer,
            role='developer'
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
            due_date=datetime.datetime(2026, 12, 31, tzinfo=datetime.timezone.utc)
        )
        self.client.force_authenticate(user=self.owner)
        self.base_url = f'/api/tasks/?project={self.project.id}'

    def test_filter_by_status_todo(self):
        res = self.client.get(f'{self.base_url}&status=todo')
        assert res.status_code == 200
        assert len(res.data['data']) == 1
        assert res.data['data'][0]['title'] == 'Todo Low'

    def test_filter_by_status_done(self):
        res = self.client.get(f'{self.base_url}&status=done')
        assert res.status_code == 200
        assert all(t['status'] == 'done' for t in res.data['data'])

    def test_filter_by_priority_high(self):
        res = self.client.get(f'{self.base_url}&priority=high')
        assert res.status_code == 200
        assert len(res.data['data']) == 1
        assert res.data['data'][0]['title'] == 'In Progress High'

    def test_filter_by_assignee(self):
        res = self.client.get(f'{self.base_url}&assignee={self.developer.id}')
        assert res.status_code == 200
        assert len(res.data['data']) == 1
        assert res.data['data'][0]['title'] == 'In Progress High'

    def test_filter_by_due_date(self):
        res = self.client.get(f'{self.base_url}&due_date=2026-12-31')
        assert res.status_code == 200
        assert len(res.data['data']) == 1
        assert res.data['data'][0]['title'] == 'Done Medium'

    def test_no_filter_returns_all_tasks(self):
        res = self.client.get(self.base_url)
        assert res.status_code == 200
        assert len(res.data['data']) == 3

    def test_filter_by_status_in_progress(self):
        res = self.client.get(f'{self.base_url}&status=in_progress')
        assert res.status_code == 200
        assert len(res.data['data']) == 1
        assert res.data['data'][0]['priority'] == 'high'


@pytest.mark.django_db
class TestTimeLogEndpoints:

    def setup_method(self):
        from apps.projects.models import Project
        from apps.projects.models import Task
        import datetime
        self.client    = APIClient()
        self.owner     = User.objects.create_user(
            username='logowner@test.com', email='logowner@test.com', password='Test1234x',
            first_name='Log', last_name='Owner'
        )
        self.manager   = User.objects.create_user(
            username='logmgr@test.com', email='logmgr@test.com', password='Test1234x',
            first_name='Log', last_name='Manager'
        )
        self.developer = User.objects.create_user(
            username='logdev@test.com', email='logdev@test.com', password='Test1234x',
            first_name='Log', last_name='Dev'
        )
        self.workspace = Workspace.objects.create(
            name='Log WS', created_by=self.owner
        )
        WorkspaceMember.objects.create(
            workspace=self.workspace, user=self.owner,
            role='owner'
        )
        WorkspaceMember.objects.create(
            workspace=self.workspace, user=self.manager,
            role='manager'
        )
        WorkspaceMember.objects.create(
            workspace=self.workspace, user=self.developer,
            role='developer'
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
        self.base_url = f'/api/tasks/{self.task.id}/timelogs/'

    def test_member_can_log_time(self):
        from django.utils.timezone import now
        self.client.force_authenticate(user=self.developer)
        res = self.client.post(self.base_url, {
            'start_time': now().isoformat(),
            'duration': 3600
        })
        assert res.status_code == 201
        assert res.data['data']['duration'] == 3600

    def test_member_can_see_own_logs(self):
        from apps.timetracking.models import TimeLog
        from django.utils.timezone import now
        TimeLog.objects.create(
            task=self.task, user=self.owner,
            start_time=now(), duration=3600
        )
        TimeLog.objects.create(
            task=self.task, user=self.developer,
            start_time=now(), duration=1800
        )
        self.client.force_authenticate(user=self.developer)
        res = self.client.get(self.base_url)
        assert res.status_code == 200
        assert len(res.data['data']) == 1

    def test_manager_sees_all_logs(self):
        from apps.timetracking.models import TimeLog
        from django.utils.timezone import now
        TimeLog.objects.create(
            task=self.task, user=self.owner,
            start_time=now(), duration=3600
        )
        TimeLog.objects.create(
            task=self.task, user=self.developer,
            start_time=now(), duration=1800
        )
        self.client.force_authenticate(user=self.manager)
        res = self.client.get(self.base_url)
        assert res.status_code == 200
        assert len(res.data['data']) >= 2

    def test_owner_sees_all_logs(self):
        from apps.timetracking.models import TimeLog
        from django.utils.timezone import now
        TimeLog.objects.create(
            task=self.task, user=self.developer,
            start_time=now(), duration=1800
        )
        self.client.force_authenticate(user=self.owner)
        res = self.client.get(self.base_url)
        assert res.status_code == 200
        assert len(res.data['data']) >= 1

    def test_outsider_cannot_log_time(self):
        from django.utils.timezone import now
        outsider = User.objects.create_user(
            username='logout@test.com', email='logout@test.com', password='Test1234x',
            first_name='Out', last_name='Sider'
        )
        self.client.force_authenticate(user=outsider)
        res = self.client.post(self.base_url, {
            'start_time': now().isoformat(),
            'duration': 3600
        })
        # 404 because outsider can't see the task to log time for it
        assert res.status_code == 404


@pytest.mark.django_db
class TestActivityFeed:

    def setup_method(self):
        from apps.projects.models import Project
        self.client = APIClient()
        self.owner  = User.objects.create_user(
            username='actowner@test.com', email='actowner@test.com', password='Test1234x',
            first_name='Act', last_name='Owner'
        )
        self.workspace = Workspace.objects.create(
            name='Act WS', created_by=self.owner
        )
        WorkspaceMember.objects.create(
            workspace=self.workspace, user=self.owner,
            role='owner'
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
        from apps.workspaces.models import ActivityFeed
        task_url = '/api/tasks/'
        self.client.post(task_url, {
            'title': 'Logged Task',
            'status': 'todo',
            'priority': 'medium',
            'project': self.project.id
        })
        count = ActivityFeed.objects.filter(
            workspace=self.workspace,
            action='created'
        ).count()
        assert count >= 1

    def test_outsider_cannot_see_activity(self):
        outsider = User.objects.create_user(
            username='actout@test.com', email='actout@test.com', password='Test1234x',
            first_name='Out', last_name='Sider'
        )
        self.client.force_authenticate(user=outsider)
        res = self.client.get(self.feed_url)
        # 404 because outsider can't see the workspace
        assert res.status_code == 404

    def test_activity_feed_has_correct_fields(self):
        from apps.workspaces.models import ActivityFeed
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


@pytest.mark.django_db
class TestMemberInvite:

    def setup_method(self):
        self.client = APIClient()
        self.owner  = User.objects.create_user(
            username='inviteowner@test.com', email='inviteowner@test.com', password='Test1234x',
            first_name='Invite', last_name='Owner'
        )
        self.manager = User.objects.create_user(
            username='invitemgr@test.com', email='invitemgr@test.com', password='Test1234x',
            first_name='Invite', last_name='Manager'
        )
        self.new_user = User.objects.create_user(
            username='newmember@test.com', email='newmember@test.com', password='Test1234x',
            first_name='New', last_name='Member'
        )
        self.workspace = Workspace.objects.create(
            name='Invite WS', created_by=self.owner
        )
        WorkspaceMember.objects.create(
            workspace=self.workspace, user=self.owner,
            role='owner'
        )
        WorkspaceMember.objects.create(
            workspace=self.workspace, user=self.manager,
            role='manager'
        )
        self.client.force_authenticate(user=self.owner)
        self.members_url = f'/api/workspaces/{self.workspace.id}/members/'

    def test_owner_can_invite_member(self):
        res = self.client.post(self.members_url, {
            'email': 'newmember@test.com',
            'role': 'developer',
        })
        assert res.status_code == 201
        assert res.data['data']['role'] == 'developer'

    def test_manager_cannot_invite_member(self):
        self.client.force_authenticate(user=self.manager)
        res = self.client.post(self.members_url, {
            'email': 'newmember@test.com',
            'role': 'viewer',
        })
        assert res.status_code == 403

    def test_cannot_invite_nonexistent_user(self):
        res = self.client.post(self.members_url, {
            'email': 'nobody@test.com',
            'role': 'developer',
        })
        assert res.status_code == 400

    def test_cannot_invite_existing_member(self):
        res = self.client.post(self.members_url, {
            'email': 'invitemgr@test.com',
            'role': 'developer',
        })
        assert res.status_code == 400

    def test_owner_can_list_members(self):
        res = self.client.get(self.members_url)
        assert res.status_code == 200
        assert len(res.data['data']) == 2

    def test_member_can_list_members(self):
        self.client.force_authenticate(user=self.manager)
        res = self.client.get(self.members_url)
        assert res.status_code == 200

    def test_outsider_cannot_list_members(self):
        outsider = User.objects.create_user(
            username='memout@test.com', email='memout@test.com', password='Test1234x',
            first_name='Out', last_name='Sider'
        )
        self.client.force_authenticate(user=outsider)
        res = self.client.get(self.members_url)
        # 404 because outsider can't see the workspace
        assert res.status_code == 404

    def test_owner_can_remove_member(self):
        WorkspaceMember.objects.create(
            workspace=self.workspace, user=self.new_user,
            role='developer'
        )
        remove_url = f'/api/workspaces/{self.workspace.id}/members/{self.new_user.id}/'
        res = self.client.delete(remove_url)
        assert res.status_code == 200

    def test_cannot_remove_owner(self):
        remove_url = f'/api/workspaces/{self.workspace.id}/members/{self.owner.id}/'
        res = self.client.delete(remove_url)
        assert res.status_code == 400


@pytest.mark.django_db
class TestEdgeCases:

    def setup_method(self):
        self.client = APIClient()
        self.owner  = User.objects.create_user(
            username='edgeowner@test.com', email='edgeowner@test.com', password='Test1234x',
            first_name='Edge', last_name='Owner'
        )
        self.workspace = Workspace.objects.create(
            name='Edge WS', created_by=self.owner
        )
        WorkspaceMember.objects.create(
            workspace=self.workspace, user=self.owner,
            role='owner'
        )
        self.client.force_authenticate(user=self.owner)

    def test_health_check_returns_200(self):
        from django.test import Client
        c = Client()
        res = c.get('/api/health/')
        assert res.status_code == 200
        data = res.json()
        assert data['status'] == 'ok'

    def test_register_with_mismatched_passwords_returns_400(self):
        res = self.client.post('/api/auth/register/', {
            'email': 'mismatch@test.com',
            'first_name': 'Test',
            'last_name': 'User',
            'password': 'Test1234x',
            'password2': 'Different1234x',
        })
        assert res.status_code == 400

    def test_register_duplicate_email_returns_400(self):
        User.objects.create_user(
            username='duplicate@test.com', email='duplicate@test.com', password='Test1234x',
            first_name='Dup', last_name='User'
        )
        res = self.client.post('/api/auth/register/', {
            'email': 'duplicate@test.com',
            'first_name': 'Dup',
            'last_name': 'User',
            'password': 'Test1234x',
            'password2': 'Test1234x',
        })
        assert res.status_code == 400

    def test_create_workspace_empty_name_returns_400(self):
        res = self.client.post('/api/workspaces/', {'name': ''})
        assert res.status_code == 400

    def test_unauthenticated_returns_401(self):
        client = APIClient()
        res = client.get('/api/workspaces/')
        assert res.status_code == 401

    def test_all_responses_have_data_and_message_fields(self):
        res = self.client.get('/api/workspaces/')
        assert res.status_code == 200
        assert 'data' in res.data
        assert 'message' in res.data

    def test_nonexistent_workspace_returns_404(self):
        import uuid
        res = self.client.get(f'/api/workspaces/{uuid.uuid4()}/')
        assert res.status_code == 404


@pytest.mark.django_db
class TestHealthCheck:

    def test_health_check_returns_ok(self):
        from django.test import Client
        client = Client()
        res = client.get('/api/health/')
        assert res.status_code == 200
        data = res.json()
        assert data['status'] == 'ok'
        assert 'timestamp' in data
        assert 'version' in data
