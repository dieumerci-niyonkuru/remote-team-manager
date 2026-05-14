from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from apps.workspaces.models import Workspace, WorkspaceMember
from .models import JobPosting
from .serializers import JobPostingSerializer

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def job_list(request, workspace_pk):
    workspace = get_object_or_404(Workspace, pk=workspace_pk)
    if not WorkspaceMember.objects.filter(workspace=workspace, user=request.user).exists():
        return Response({'data': None, 'message': 'Not a member'}, status=403)
    if request.method == 'GET':
        jobs = JobPosting.objects.filter(workspace=workspace)
        return Response({'data': JobPostingSerializer(jobs, many=True).data, 'message': 'Success'})
    serializer = JobPostingSerializer(data=request.data)
    if serializer.is_valid():
        job = serializer.save(workspace=workspace, created_by=request.user)
        return Response({'data': JobPostingSerializer(job).data, 'message': 'Job created'}, status=201)
    return Response({'data': None, 'message': serializer.errors}, status=400)
