from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User
from .serializers import UserSerializer


class TwoFactorLoginView(generics.GenericAPIView):
    """
    Two-step login: first verifies username+password, then checks OTP token if 2FA is enabled.
    POST /api/auth/login/2fa/  { username, password, otp_token (optional) }
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username') or request.data.get('email')
        password = request.data.get('password')
        otp_token = request.data.get('otp_token', '')

        if not username or not password:
            return Response({'detail': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request, username=username, password=password)
        if not user:
            # Try email-as-username lookup
            try:
                u = User.objects.get(email=username)
                user = authenticate(request, username=u.username, password=password)
            except User.DoesNotExist:
                pass

        if not user:
            return Response({'detail': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_active:
            return Response({'detail': 'Account is disabled.'}, status=status.HTTP_403_FORBIDDEN)

        # If user has 2FA enabled, verify OTP token
        if hasattr(user, 'otp_enabled') and user.otp_enabled:
            if not otp_token:
                return Response({'detail': '2FA required.', 'requires_otp': True}, status=status.HTTP_200_OK)
            try:
                from .utils.otp import verify_otp
                if not verify_otp(user, otp_token):
                    return Response({'detail': 'Invalid OTP token.'}, status=status.HTTP_401_UNAUTHORIZED)
            except ImportError:
                pass

        refresh = RefreshToken.for_user(user)
        return Response({
            'data': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': UserSerializer(user, context={'request': request}).data,
            },
            'message': 'Login successful.'
        })
