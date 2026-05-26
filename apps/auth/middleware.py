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
        # Allow camera/mic for WebRTC video calls (same policy as SecurityHeadersMiddleware).
        # SecurityHeadersMiddleware runs after this and will overwrite, but this ensures
        # the correct policy if SecurityHeadersMiddleware is ever removed from the stack.
        if 'Permissions-Policy' not in response:
            response['Permissions-Policy'] = (
                'geolocation=(), microphone=(self), camera=(self), '
                'fullscreen=(self), picture-in-picture=(self)'
            )
        if 'X-Content-Type-Options' not in response:
            response['X-Content-Type-Options'] = 'nosniff'
        return response
