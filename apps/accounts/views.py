from rest_framework import generics, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from .models import User
from .serializers import UserSerializer, RegisterSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        return self.request.user

class UpdateProfileView(generics.UpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        return self.request.user

from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from .utils.otp import generate_otp_secret, generate_qr_code, verify_otp

class UserProfileView(generics.RetrieveUpdateAPIView):
    # ... existing code ...

    @action(detail=False, methods=['post'])
    def enable_2fa(self, request):
        user = request.user
        if not user.otp_secret:
            user.otp_secret = generate_otp_secret()
            user.save()
        qr_code = generate_qr_code(user.otp_secret, user.email)
        return Response({'secret': user.otp_secret, 'qr_code': qr_code})

    @action(detail=False, methods=['post'])
    def verify_2fa(self, request):
        user = request.user
        token = request.data.get('token')
        if not token:
            return Response({'error': 'Token required'}, status=status.HTTP_400_BAD_REQUEST)
        if verify_otp(user.otp_secret, token):
            user.otp_enabled = True
            user.save()
            return Response({'message': '2FA enabled successfully'})
        return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def disable_2fa(self, request):
        user = request.user
        user.otp_secret = None
        user.otp_enabled = False
        user.save()
        return Response({'message': '2FA disabled'})
