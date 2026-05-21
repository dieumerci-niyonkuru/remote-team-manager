class RoleMiddleware:
    """Middleware to attach the user's role to the request for easy access.
    If the user is authenticated, request.role == user.role; otherwise defaults to 'guest'.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Ensure request has a user attribute (AuthenticationMiddleware runs before this)
        if hasattr(request, "user") and request.user.is_authenticated:
            # Assuming the User model has a 'role' field
            request.role = getattr(request.user, "role", "guest")
        else:
            request.role = "guest"
        response = self.get_response(request)
        return response
