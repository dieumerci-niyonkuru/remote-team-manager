import django_filters
from .models import Task


class TaskFilter(django_filters.FilterSet):
    status   = django_filters.CharFilter(field_name='status')
    priority = django_filters.CharFilter(field_name='priority')
    assignee = django_filters.UUIDFilter(field_name='assignee__id')
    due_date = django_filters.DateFilter(field_name='due_date')
    due_before = django_filters.DateFilter(field_name='due_date', lookup_expr='lte')
    due_after  = django_filters.DateFilter(field_name='due_date', lookup_expr='gte')

    class Meta:
        model  = Task
        fields = ['status', 'priority', 'assignee', 'due_date']
