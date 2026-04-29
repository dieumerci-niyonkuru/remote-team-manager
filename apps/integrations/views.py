from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
import json

@csrf_exempt
@api_view(['POST'])
def slack_webhook(request):
    return Response({'status': 'ok'})
