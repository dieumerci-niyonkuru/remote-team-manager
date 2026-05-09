from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from rest_framework.validators import UniqueValidator
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role', 'bio', 'phone', 'avatar', 'profile_visibility')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    email = serializers.EmailField(required=True, validators=[UniqueValidator(queryset=User.objects.all(), message="A user with this email already exists.")])

    class Meta:
        model = User
        fields = ('password', 'password2', 'email', 'first_name', 'last_name', 'role', 'avatar')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        # Use email as username
        email = validated_data.get('email')
        validated_data['username'] = email
        user = User.objects.create_user(**validated_data)
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    email = serializers.EmailField(required=False)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.username_field in self.fields:
            self.fields[self.username_field].required = False

    def validate(self, attrs):
        # The frontend sends 'email' instead of 'username'
        email = attrs.get('email')
        
        if email:
            attrs[self.username_field] = email
        
        data = super().validate(attrs)
        
        # Include user data
        user_data = UserSerializer(self.user).data
        
        # Wrap in 'data' key to match frontend expectation
        return {
            "data": {
                "access": data['access'],
                "refresh": data['refresh'],
                "user": user_data
            }
        }
