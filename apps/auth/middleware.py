class RoleMiddleware:
    """Attach the user's role to the request for easy access."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if hasattr(request, 'user') and request.user.is_authenticated:
            request.role = getattr(request.user, 'role', 'guest')
        else:
            request.role = 'guest'
        response = self.get_response(request)
        self._add_security_headers(response)
        return response

    def _add_security_headers(self, response):
        if 'Content-Security-Policy' not in response:
            response['Content-Security-Policy'] = (
                "default-src 'self'; "
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
                "font-src 'self' https://fonts.gstatic.com; "
                "img-src 'self' data: blob: https:; "
                "connect-src 'self' wss: https:; "
                "frame-ancestors 'none';"
            )
        response['Permissions-Policy'] = (
            'camera=(), microphone=(), geolocation=(), payment=()'
        )
        response['X-Content-Type-Options'] = 'nosniff'
        return response
