from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from .models import User
from .serializers import RegisterSerializer, UserSerializer, UpdateUserSerializer


def success_response(data=None, message='Success', status_code=200):
    return Response({'data': data, 'message': message}, status=status_code)


def error_response(message='Error', status_code=400):
    return Response({'data': None, 'message': message}, status=status_code)


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({'data': None, 'message': serializer.errors}, status=400)
    user = serializer.save()
    tokens = RefreshToken.for_user(user)
    return success_response(
        data={
            'user': UserSerializer(user).data,
            'access': str(tokens.access_token),
            'refresh': str(tokens),
        },
        message='Account created successfully.',
        status_code=201
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    email    = request.data.get('email', '').strip().lower()
    password = request.data.get('password', '')
    if not email or not password:
        return error_response('Email and password are required.')
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return error_response('Invalid credentials.', 401)
    if not user.check_password(password):
        return error_response('Invalid credentials.', 401)
    if not user.is_active:
        return error_response('Account is disabled.', 403)
    tokens = RefreshToken.for_user(user)
    return success_response(
        data={
            'user': UserSerializer(user).data,
            'access': str(tokens.access_token),
            'refresh': str(tokens),
        },
        message='Login successful.'
    )


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def me(request):
    if request.method == 'GET':
        return success_response(data=UserSerializer(request.user).data)
    serializer = UpdateUserSerializer(request.user, data=request.data, partial=True)
    if not serializer.is_valid():
        return Response({'data': None, 'message': serializer.errors}, status=400)
    serializer.save()
    return success_response(data=UserSerializer(request.user).data, message='Profile updated.')


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    refresh_token = request.data.get('refresh')
    if not refresh_token:
        return error_response('Refresh token is required.')
    try:
        token = RefreshToken(refresh_token)
        token.blacklist()
        return success_response(message='Logged out successfully.')
    except TokenError:
        return error_response('Invalid or expired token.')
