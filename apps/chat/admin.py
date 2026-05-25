from django.contrib import admin
from .models import ChatRoom, Message, MessageReaction, ReadReceipt


@admin.register(ChatRoom)
class ChatRoomAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'room_type', 'workspace', 'created_at')
    list_filter = ('room_type',)
    search_fields = ('name',)


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'sender', 'room', 'is_edited', 'is_deleted', 'is_pinned', 'created_at')
    list_filter = ('is_deleted', 'is_pinned', 'is_edited')
    search_fields = ('content', 'sender__username')


@admin.register(MessageReaction)
class MessageReactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'message', 'user', 'emoji', 'created_at')


@admin.register(ReadReceipt)
class ReadReceiptAdmin(admin.ModelAdmin):
    list_display = ('id', 'message', 'user', 'read_at')
