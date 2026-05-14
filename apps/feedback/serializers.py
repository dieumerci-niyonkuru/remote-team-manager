from rest_framework import serializers
from .models import Feedback

class FeedbackSerializer(serializers.ModelSerializer):
    user_name = serializers.ReadOnlyField(source='user.username')
    
    class Meta:
        model = Feedback
        fields = ['id', 'user', 'user_name', 'type', 'subject', 'message', 'created_at', 'is_resolved']
        read_only_fields = ['user', 'created_at', 'is_resolved']
