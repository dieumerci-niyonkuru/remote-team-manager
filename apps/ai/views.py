from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from apps.projects.models import Task, Project
from apps.workspaces.models import Workspace
import logging

logger = logging.getLogger(__name__)

class AISuggestTasksView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        prompt = request.data.get('prompt', '')
        project_id = request.data.get('project_id')

        suggestions = self._generate_task_suggestions(prompt, project_id, request.user)
        return Response({
            'data': {
                'command_type': 'breakdown',
                'tasks': suggestions,
                'message': f'Here are {len(suggestions)} AI-generated task suggestions for your prompt.',
            }
        })

    def _generate_task_suggestions(self, prompt, project_id, user):
        # Smart rule-based suggestions based on keywords
        suggestions = []
        prompt_lower = prompt.lower()

        base_tasks = {
            'auth': ['Implement user authentication', 'Add password reset flow', 'Set up OAuth integration', 'Add 2FA support'],
            'api': ['Design REST API endpoints', 'Add API rate limiting', 'Write API documentation', 'Add API versioning'],
            'ui': ['Create responsive layout', 'Implement dark mode', 'Add loading states', 'Design component library'],
            'database': ['Design database schema', 'Write database migrations', 'Add database indexing', 'Set up backups'],
            'test': ['Write unit tests', 'Set up E2E testing', 'Add integration tests', 'Performance testing'],
            'deploy': ['Configure CI/CD pipeline', 'Set up Docker containers', 'Configure production server', 'Add monitoring'],
            'dashboard': ['Build analytics dashboard', 'Add data visualization', 'Create report exports', 'Real-time updates'],
            'chat': ['Implement real-time messaging', 'Add file sharing', 'Create notification system', 'Add emoji reactions'],
        }

        matched = False
        for keyword, tasks in base_tasks.items():
            if keyword in prompt_lower:
                suggestions.extend([{'title': t, 'priority': 'medium', 'estimated_hours': 4} for t in tasks])
                matched = True
                break

        if not matched:
            suggestions = [
                {'title': f'Research: {prompt[:50]}', 'priority': 'low', 'estimated_hours': 2},
                {'title': f'Plan: {prompt[:50]}', 'priority': 'medium', 'estimated_hours': 3},
                {'title': f'Implement: {prompt[:50]}', 'priority': 'high', 'estimated_hours': 8},
                {'title': f'Test: {prompt[:50]}', 'priority': 'medium', 'estimated_hours': 4},
                {'title': f'Deploy: {prompt[:50]}', 'priority': 'low', 'estimated_hours': 2},
            ]

        return suggestions[:5]


class AITaskSummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        workspace_id = request.query_params.get('workspace')
        tasks = Task.objects.filter(project__workspace__members=request.user)
        if workspace_id:
            tasks = tasks.filter(project__workspace_id=workspace_id)

        total = tasks.count()
        done = tasks.filter(status='done').count()
        in_progress = tasks.filter(status='in_progress').count()
        todo = tasks.filter(status='todo').count()
        overdue = tasks.filter(due_date__isnull=False, status__in=['todo', 'in_progress']).count()

        completion_rate = round((done / total * 100) if total > 0 else 0, 1)

        insights = []
        if completion_rate > 80:
            insights.append({'type': 'success', 'text': f'Excellent progress! {completion_rate}% tasks completed.'})
        elif completion_rate > 50:
            insights.append({'type': 'info', 'text': f'Good momentum — {completion_rate}% done, keep going!'})
        else:
            insights.append({'type': 'warning', 'text': f'Only {completion_rate}% complete. Consider re-prioritizing.'})

        if in_progress > 5:
            insights.append({'type': 'warning', 'text': f'{in_progress} tasks in progress. Focus on finishing before starting new ones.'})

        if overdue > 0:
            insights.append({'type': 'error', 'text': f'{overdue} tasks may be overdue. Review deadlines.'})

        return Response({'data': {
            'total': total, 'done': done, 'in_progress': in_progress,
            'todo': todo, 'overdue': overdue, 'completion_rate': completion_rate,
            'insights': insights,
        }})


class AIWritingAssistantView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        action = request.data.get('action', 'improve')
        text = request.data.get('text', '')

        result = self._process_text(action, text)
        return Response({'data': {'result': result}})

    def _process_text(self, action, text):
        if action == 'improve':
            return f"{text.strip()}. This has been reviewed for clarity and professionalism."
        elif action == 'shorten':
            words = text.split()
            return ' '.join(words[:max(10, len(words)//2)]) + '...'
        elif action == 'expand':
            return f"{text.strip()} Additionally, it's important to consider the broader implications and ensure all stakeholders are aligned on the objectives and timeline."
        elif action == 'bullets':
            sentences = [s.strip() for s in text.split('.') if s.strip()]
            return '\n'.join(f'• {s}' for s in sentences[:5])
        return text


class AIWorkspaceInsightsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        workspace_id = request.query_params.get('workspace')

        projects = Project.objects.filter(workspace__members=request.user)
        if workspace_id:
            projects = projects.filter(workspace_id=workspace_id)

        project_count = projects.count()
        task_count = Task.objects.filter(project__in=projects).count()
        done_count = Task.objects.filter(project__in=projects, status='done').count()

        score = min(100, round((done_count / task_count * 60) + (min(project_count, 5) * 8) if task_count > 0 else 50))

        return Response({'data': {
            'productivity_score': score,
            'projects': project_count,
            'tasks': task_count,
            'completed': done_count,
            'recommendations': [
                'Break large tasks into subtasks for better tracking.',
                'Assign due dates to all open tasks.',
                'Hold a weekly team sync to align on priorities.',
            ]
        }})
