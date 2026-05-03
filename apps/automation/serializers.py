from rest_framework import serializers
from .models import AutomationRule

class AutomationRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = AutomationRule
        fields = '__all__'
        read_only_fields = ('created_by', 'created_at')
