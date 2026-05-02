from rest_framework import serializers
from .models import Objective, KeyResult

class KeyResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = KeyResult
        fields = '__all__'

class ObjectiveSerializer(serializers.ModelSerializer):
    key_results = KeyResultSerializer(many=True, read_only=True)
    class Meta:
        model = Objective
        fields = '__all__'
        read_only_fields = ('created_by',)
