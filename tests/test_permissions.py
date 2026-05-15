import pytest
from django.test import TestCase
from apps.accounts.models import User
from apps.workspaces.models import Workspace, WorkspaceMember


@pytest.mark.django_db
class TestWorkspacePermissions:

    def setup_method(self):
        """Create users and workspace for each test."""
        self.owner = User.objects.create_user(
            username='owner@test.com', email='owner@test.com', password='Test1234x',
            first_name='Owner', last_name='User'
        )
        self.manager = User.objects.create_user(
            username='manager@test.com', email='manager@test.com', password='Test1234x',
            first_name='Manager', last_name='User'
        )
        self.developer = User.objects.create_user(
            username='dev@test.com', email='dev@test.com', password='Test1234x',
            first_name='Dev', last_name='User'
        )
        self.viewer = User.objects.create_user(
            username='viewer@test.com', email='viewer@test.com', password='Test1234x',
            first_name='Viewer', last_name='User'
        )
        self.outsider = User.objects.create_user(
            username='outsider@test.com', email='outsider@test.com', password='Test1234x',
            first_name='Out', last_name='Sider'
        )
        self.workspace = Workspace.objects.create(
            name='Test Workspace', created_by=self.owner
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

    def get_role(self, user):
        try:
            return WorkspaceMember.objects.get(
                workspace=self.workspace, user=user
            ).role
        except WorkspaceMember.DoesNotExist:
            return None

    def test_owner_role_is_correct(self):
        assert self.get_role(self.owner) == 'owner'

    def test_manager_role_is_correct(self):
        assert self.get_role(self.manager) == 'manager'

    def test_developer_role_is_correct(self):
        assert self.get_role(self.developer) == 'developer'

    def test_viewer_role_is_correct(self):
        assert self.get_role(self.viewer) == 'viewer'

    def test_outsider_is_not_member(self):
        assert self.get_role(self.outsider) is None

    def test_unique_together_prevents_duplicate_member(self):
        from django.db import IntegrityError
        with pytest.raises(IntegrityError):
            WorkspaceMember.objects.create(
                workspace=self.workspace,
                user=self.owner,
                role='viewer'
            )

    def test_workspace_has_4_members(self):
        assert self.workspace.members.count() == 4

    def test_owner_can_be_identified(self):
        member = WorkspaceMember.objects.get(
            workspace=self.workspace, user=self.owner
        )
        assert member.role == 'owner'

    def test_viewer_cannot_manage(self):
        member = WorkspaceMember.objects.get(
            workspace=self.workspace, user=self.viewer
        )
        assert member.role not in [
            'owner',
            'manager',
        ]
