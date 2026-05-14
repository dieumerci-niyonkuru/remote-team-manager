from rest_framework import serializers
from .models import WikiArticle

class WikiArticleSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = WikiArticle
        fields = '__all__'
        read_only_fields = ('author', 'created_at', 'updated_at')

    def get_author_name(self, obj):
        return f"{obj.author.first_name} {obj.author.last_name}".strip() or obj.author.username
