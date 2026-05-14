import pytest
from django.urls import reverse
from rest_framework import status
from apps.chat.models import Channel, Message, ChannelMembership

@pytest.mark.django_db
class TestChatAPI:
    def test_create_channel(self, authenticated_client):
        client, user = authenticated_client
        # We need a workspace first
        from apps.workspaces.models import Workspace
        workspace = Workspace.objects.create(name="Test Workspace", created_by=user)
        
        url = reverse('channel-list')
        data = {'name': 'general', 'workspace': workspace.id}
        response = client.post(url, data)
        
        assert response.status_code == status.HTTP_201_CREATED
        assert Channel.objects.count() == 1
        assert ChannelMembership.objects.filter(user=user, role='owner').exists()

    def test_send_message(self, authenticated_client):
        client, user = authenticated_client
        from apps.workspaces.models import Workspace
        workspace = Workspace.objects.create(name="Test Workspace", created_by=user)
        channel = Channel.objects.create(name='general', workspace=workspace, created_by=user)
        ChannelMembership.objects.create(channel=channel, user=user, role='owner')
        
        url = reverse('message-list')
        data = {'content': 'Hello world!', 'channel': channel.id}
        response = client.post(url, data)
        
        assert response.status_code == status.HTTP_201_CREATED
        assert Message.objects.count() == 1

    def test_mention_notification(self, authenticated_client, create_user):
        client, user = authenticated_client
        other_user = create_user(username='otheruser', email='other@test.com', first_name='Other')
        
        from apps.workspaces.models import Workspace
        workspace = Workspace.objects.create(name="Test Workspace", created_by=user)
        channel = Channel.objects.create(name='general', workspace=workspace, created_by=user)
        ChannelMembership.objects.create(channel=channel, user=user)
        
        url = reverse('message-list')
        data = {'content': f'Hello @{other_user.username}', 'channel': channel.id}
        client.post(url, data)
        
        from apps.notifications.models import Notification
        assert Notification.objects.filter(recipient=other_user).exists()
