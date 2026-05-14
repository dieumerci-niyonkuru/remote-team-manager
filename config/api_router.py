from rest_framework.routers import DefaultRouter
from apps.workspaces.views import WorkspaceViewSet
from apps.projects.views import ProjectViewSet, TaskViewSet, CommentViewSet, SuggestionViewSet, ReactionViewSet
from apps.chat.views import ChannelViewSet, MessageViewSet, DirectMessageViewSet
from apps.hr.views import EmployeeProfileViewSet, JobPostingViewSet, PayrollRecordViewSet
from apps.notifications.views import NotificationViewSet, InviteViewSet
from apps.presence.views import PresenceViewSet
from apps.communications.views import FriendRequestViewSet, FileAttachmentViewSet
from apps.okr.views import ObjectiveViewSet, KeyResultViewSet
from apps.automation.views import AutomationRuleViewSet
from apps.wiki.views import WikiArticleViewSet
from apps.integrations.views import IntegrationViewSet

router = DefaultRouter()

# Workspaces
router.register(r'workspaces', WorkspaceViewSet, basename='workspace')

# Projects & Tasks
router.register(r'projects', ProjectViewSet, basename='project')
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'comments', CommentViewSet, basename='comment')
router.register(r'suggestions', SuggestionViewSet, basename='suggestion')
router.register(r'reactions', ReactionViewSet, basename='reaction')

# Chat
router.register(r'channels', ChannelViewSet, basename='channel')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'direct-messages', DirectMessageViewSet, basename='directmessage')

# HR
router.register(r'employee-profiles', EmployeeProfileViewSet, basename='employeeprofile')
router.register(r'job-postings', JobPostingViewSet, basename='jobposting')
router.register(r'payroll', PayrollRecordViewSet, basename='payroll')

# Notifications & Invites
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'invites', InviteViewSet, basename='invite')

# Presence
router.register(r'presence', PresenceViewSet, basename='userpresence')

# Communications
router.register(r'friend-requests', FriendRequestViewSet, basename='friendrequest')
router.register(r'file-attachments', FileAttachmentViewSet, basename='fileattachment')

# OKR
router.register(r'objectives', ObjectiveViewSet, basename='objective')
router.register(r'key-results', KeyResultViewSet, basename='keyresult')

# Automation
router.register(r'automation-rules', AutomationRuleViewSet, basename='automationrule')

# Wiki
router.register(r'wiki-articles', WikiArticleViewSet, basename='wikiarticle')

# Integrations
router.register(r'integrations', IntegrationViewSet, basename='integration')

urlpatterns = router.urls
