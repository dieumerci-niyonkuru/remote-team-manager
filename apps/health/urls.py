import datetime
from django.urls import path
from django.http import JsonResponse


def health(request):
    return JsonResponse({
        'status': 'ok',
        'timestamp': datetime.datetime.now().isoformat(),
        'version': '1.0.0'
    })


urlpatterns = [
    path('', health, name='health'),
]
