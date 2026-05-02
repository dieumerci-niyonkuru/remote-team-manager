from rest_framework import serializers
from .models import Channel, Message, DirectMessage, ChannelMembership
from apps.accounts.serializers import UserSerializer

class ChannelMembershipSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    class Meta:
        model = ChannelMembership
        fields = ('id', 'user', 'joined_at', 'is_pending')

class ChannelSerializer(serializers.ModelSerializer):
    members = ChannelMembershipSerializer(source='memberships', many=True, read_only=True)
    is_member = serializers.SerializerMethodField()
    class Meta:
        model = Channel
        fields = '__all__'
        read_only_fields = ('created_by',)

    def get_is_member(self, obj):
        user = self.context['request'].user
        return obj.memberships.filter(user=user, is_pending=False).exists()

class MessageSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    reactions = serializers.SerializerMethodField()
    class Meta:
        model = Message
        fields = '__all__'
        read_only_fields = ('user',)

    def get_reactions(self, obj):
        from .models import MessageReaction
        reactions = obj.reactions.all()
        return {r.emoji: r.user.id for r in reactions}

class DirectMessageSerializer(serializers.ModelSerializer):
    participants = UserSerializer(many=True, read_only=True)
    messages = MessageSerializer(many=True, read_only=True)
    class Meta:
        model = DirectMessage
        fields = '__all__'
