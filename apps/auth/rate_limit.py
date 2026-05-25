from django.core.cache import cache
from django.http import JsonResponse
import time
import logging

logger = logging.getLogger('apps.auth.rate_limit')


class RateLimitMiddleware:
    """IP-based rate limiting with tiered limits for different endpoint types."""

    LIMITS = {
        'auth_login':    (5,  60),   # 5 login attempts per minute
        'auth_register': (3,  300),  # 3 register attempts per 5 minutes
        'auth':          (20, 60),   # 20 auth requests per minute (general)
        'api':           (200, 60),  # 200 API requests per minute
        'global':        (300, 60),  # 300 total requests per minute
    }

    BYPASS_PATHS = ['/api/health/', '/static/', '/media/']

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Skip rate limiting for health checks and static files
        path = request.path
        if any(path.startswith(p) for p in self.BYPASS_PATHS):
            return self.get_response(request)

        ip = self._get_ip(request)
        category, limit, window = self._categorize(path)
        key = f'rl:{category}:{ip}:{int(time.time()) // window}'

        try:
            count = cache.get(key, 0)
            if count >= limit:
                logger.warning('Rate limit exceeded: ip=%s category=%s count=%d', ip, category, count)
                return JsonResponse(
                    {
                        'error': 'Too many requests. Please slow down.',
                        'retry_after': window,
                        'category': category,
                    },
                    status=429,
                    headers={'Retry-After': str(window)},
                )
            cache.set(key, count + 1, window)
        except Exception:
            # Cache failure — allow request through rather than blocking users
            pass

        response = self.get_response(request)
        response['X-RateLimit-Category'] = category
        return response

    def _categorize(self, path):
        if path.startswith('/api/auth/login'):
            limit, window = self.LIMITS['auth_login']
            return 'auth_login', limit, window
        if path.startswith('/api/auth/register'):
            limit, window = self.LIMITS['auth_register']
            return 'auth_register', limit, window
        if path.startswith('/api/auth/'):
            limit, window = self.LIMITS['auth']
            return 'auth', limit, window
        if path.startswith('/api/'):
            limit, window = self.LIMITS['api']
            return 'api', limit, window
        limit, window = self.LIMITS['global']
        return 'global', limit, window

    def _get_ip(self, request):
        x_forwarded = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded:
            return x_forwarded.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR', '0.0.0.0')
