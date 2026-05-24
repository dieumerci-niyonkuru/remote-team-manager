from django.urls import path
from django.http import JsonResponse

def health(request):
    return JsonResponse({'status': 'ok', 'timestamp': '2026-05-24'})

urlpatterns = [
    path('', health, name='health'),
]
