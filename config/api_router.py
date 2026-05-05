from rest_framework.routers import DefaultRouter
from apps.workspaces.views import WorkspaceViewSet
from apps.projects.views import ProjectViewSet, TaskViewSet, CommentViewSet, SuggestionViewSet, ReactionViewSet
from apps.chat.views import ChannelViewSet, MessageViewSet, DirectMessageViewSet
from apps.hr.views import EmployeeProfileViewSet, JobPostingViewSet, PayrollRecordViewSet
from apps.notifications.views import NotificationViewSet
from apps.presence.views import UserPresenceViewSet
from apps.communications.views import MeetingViewSet, EmailLogViewSet, CallLogViewSet
from apps.timetracking.views import TimeLogViewSet
from apps.okr.views import ObjectiveViewSet, KeyResultViewSet
from apps.ai.views import AISuggestionViewSet
from apps.automation.views import AutomationRuleViewSet
from apps.wiki.views import WikiArticleViewSet

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

# Notifications
router.register(r'notifications', NotificationViewSet, basename='notification')

# Presence
router.register(r'presence', UserPresenceViewSet, basename='userpresence')

# Communications
router.register(r'meetings', MeetingViewSet, basename='meeting')
router.register(r'email-logs', EmailLogViewSet, basename='emaillog')
router.register(r'call-logs', CallLogViewSet, basename='calllog')

# Time Tracking
router.register(r'timelogs', TimeLogViewSet, basename='timelog')

# OKR
router.register(r'objectives', ObjectiveViewSet, basename='objective')
router.register(r'key-results', KeyResultViewSet, basename='keyresult')

# AI
router.register(r'ai-suggestions', AISuggestionViewSet, basename='aisuggestion')

# Automation
router.register(r'automation-rules', AutomationRuleViewSet, basename='automationrule')

# Wiki
router.register(r'wiki-articles', WikiArticleViewSet, basename='wikiarticle')

urlpatterns = router.urls
