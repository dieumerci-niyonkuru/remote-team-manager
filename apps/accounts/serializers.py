from typing import Any, Dict, Optional
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.db import IntegrityError
from rest_framework.validators import UniqueValidator
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User

class UserSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'avatar', 'avatar_url', 'bio', 'phone')
        extra_kwargs = {
            'avatar': {'write_only': True},
        }

    def get_avatar_url(self, obj: User) -> Optional[str]:
        request = self.context.get('request')
        if obj.avatar and request:
            return request.build_absolute_uri(obj.avatar.url)
        return None

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password],
        error_messages={'required': 'Please provide a password.'}
    )
    password2 = serializers.CharField(
        write_only=True, 
        required=True,
        error_messages={'required': 'Please confirm your password.'}
    )
    email = serializers.EmailField(
        required=True, 
        validators=[UniqueValidator(queryset=User.objects.all(), message="This email is already in use.")],
        error_messages={'required': 'Please enter your email address.', 'invalid': 'Please enter a valid email.'}
    )

    class Meta:
        model = User
        fields = ('password', 'password2', 'email', 'first_name', 'last_name', 'role', 'avatar')

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password2": "Passwords do not match. Please try again."})
        return attrs

    def create(self, validated_data: Dict[str, Any]) -> User:
        validated_data.pop('password2')
        # Use email as username automatically
        email = validated_data.get('email')
        validated_data['username'] = email
        try:
            user = User.objects.create_user(**validated_data)
        except IntegrityError:
            # Race condition: two simultaneous registrations with the same email,
            # or the username/email unique constraint fires after UniqueValidator passed.
            raise serializers.ValidationError({
                "email": "An account with this email already exists. Please sign in instead."
            })
        return user

import logging

logger = logging.getLogger(__name__)

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    email = serializers.EmailField(required=False, help_text='User email for login (optional, will be used as username if provided)')
    username = serializers.CharField(required=False, help_text='Username for login (optional)')

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)
        if self.username_field in self.fields:
            self.fields[self.username_field].required = False

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        # Log incoming attrs for debugging
        logger.debug('CustomTokenObtainPairSerializer.validate called with attrs: %s', attrs)
        # Support both email and username for authentication
        email = attrs.get('email')
        username = attrs.get('username')
        if email:
            attrs[self.username_field] = email
        elif username:
            attrs[self.username_field] = username
        else:
            # If neither provided, let the parent validation raise appropriate error
            pass
        
        data = super().validate(attrs)
        
        # Include detailed user data in response
        user_data = UserSerializer(self.user).data
        
        return {
            "data": {
                "access": data['access'],
                "refresh": data['refresh'],
                "user": user_data
            },
            "message": "Welcome back! Login successful."
        }
