from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def suggest_task(request):
    # Simple placeholder – can be replaced with OpenAI API later
    return Response({'suggestion': 'Break into smaller tasks, assign to a team member, set a due date.'})
