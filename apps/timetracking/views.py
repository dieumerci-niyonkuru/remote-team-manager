from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.utils.timezone import now
from .models import TimeLog
from apps.projects.models import Task

class StartTimerView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        task_id = request.data.get('task_id')
        try:
            task = Task.objects.get(id=task_id, project__workspace__members=request.user)
        except Task.DoesNotExist:
            return Response({'error': 'Task not found'}, status=status.HTTP_404_NOT_FOUND)

        # Stop any running timer for this user (optional: allow only one active timer)
        # For simplicity, allow multiple but we'll ensure only one per task
        active_log = TimeLog.objects.filter(user=request.user, is_running=True).first()
        if active_log and active_log.task != task:
            return Response({'error': 'You have an active timer on another task. Please stop it first.'}, status=400)

        timelog = TimeLog.objects.create(task=task, user=request.user, start_time=now(), is_running=True)
        return Response({'id': timelog.id, 'start_time': timelog.start_time})

class PauseTimerView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        task_id = request.data.get('task_id')
        try:
            task = Task.objects.get(id=task_id)
        except Task.DoesNotExist:
            return Response({'error': 'Task not found'}, status=404)

        timelog = TimeLog.objects.filter(task=task, user=request.user, is_running=True).last()
        if not timelog:
            return Response({'error': 'No active timer for this task'}, status=400)

        timelog.end_time = now()
        timelog.duration = (timelog.end_time - timelog.start_time).total_seconds()
        timelog.is_running = False
        timelog.save()
        return Response({'duration': timelog.duration})

class TaskTimeLogsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        logs = TimeLog.objects.filter(user=user).select_related('task')
        data = []
        for log in logs:
            data.append({
                'task_id': log.task.id,
                'task_title': log.task.title,
                'duration_seconds': log.duration,
                'start_time': log.start_time,
                'end_time': log.end_time,
            })
        return Response(data)
