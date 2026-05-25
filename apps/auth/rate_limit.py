from django.core.cache import cache
from django.http import JsonResponse
import time

class RateLimitMiddleware:
    """Simple IP-based rate limiting: 100 req/min globally, 10/min for auth endpoints."""
    GLOBAL_LIMIT = 100
    AUTH_LIMIT = 10
    WINDOW = 60  # seconds

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        ip = self._get_ip(request)
        is_auth = request.path.startswith('/api/auth/')
        limit = self.AUTH_LIMIT if is_auth else self.GLOBAL_LIMIT
        key = f"rl:{'auth' if is_auth else 'global'}:{ip}"

        now = int(time.time())
        window_key = f"{key}:{now // self.WINDOW}"
        count = cache.get(window_key, 0)

        if count >= limit:
            return JsonResponse({'error': 'Too many requests. Please slow down.', 'retry_after': self.WINDOW}, status=429)

        cache.set(window_key, count + 1, self.WINDOW)
        return self.get_response(request)

    def _get_ip(self, request):
        x_forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded:
            return x_forwarded.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR', '0.0.0.0')
