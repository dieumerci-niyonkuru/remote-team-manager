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
        task = Task.objects.get(id=task_id)
        timelog = TimeLog.objects.create(task=task, user=request.user, start_time=now(), is_running=True)
        return Response({'id': timelog.id})

class PauseTimerView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        task_id = request.data.get('task_id')
        timelog = TimeLog.objects.filter(task_id=task_id, user=request.user, is_running=True).last()
        if timelog:
            timelog.end_time = now()
            timelog.duration = int((timelog.end_time - timelog.start_time).total_seconds())
            timelog.is_running = False
            timelog.save()
        return Response({'status': 'paused'})
