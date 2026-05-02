from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import exceptions
from .utils.otp import verify_otp

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        credentials = {
            'username': attrs.get('username'),
            'password': attrs.get('password')
        }
        user = None
        try:
            user = self.context['request'].user
        except:
            pass
        if user and user.is_authenticated and user.otp_enabled:
            # User is already authenticated? Actually we need to check password first.
            # We'll override to include OTP token.
            pass
        return super().validate(attrs)

# Simpler: create a custom view that first verifies password, then checks OTP token.
# We'll add a new endpoint /api/accounts/login/2fa/ that expects username, password, otp_token.
