from rest_framework import serializers
from .models import WikiArticle, WikiRevision

class WikiRevisionSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    class Meta:
        model = WikiRevision
        fields = ('id', 'content', 'author_name', 'created_at')
        read_only_fields = ('author', 'created_at')

    def get_author_name(self, obj):
        if obj.author:
            return f"{obj.author.first_name} {obj.author.last_name}".strip() or obj.author.username
        return None

class WikiArticleSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    parent = serializers.PrimaryKeyRelatedField(queryset=WikiArticle.objects.all(), allow_null=True, required=False)
    revisions = WikiRevisionSerializer(many=True, read_only=True)

    class Meta:
        model = WikiArticle
        fields = '__all__'
        read_only_fields = ('author', 'created_at', 'updated_at')

    def get_author_name(self, obj):
        return f"{obj.author.first_name} {obj.author.last_name}".strip() or obj.author.username
