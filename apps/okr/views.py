from rest_framework import viewsets, permissions
from .models import Objective, KeyResult
from .serializers import ObjectiveSerializer, KeyResultSerializer

class ObjectiveViewSet(viewsets.ModelViewSet):
    serializer_class = ObjectiveSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Objective.objects.none()  # placeholder, will be overridden by get_queryset

    def get_queryset(self):
        return Objective.objects.filter(workspace__members=self.request.user)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class KeyResultViewSet(viewsets.ModelViewSet):
    serializer_class = KeyResultSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = KeyResult.objects.none()

    def get_queryset(self):
        qs = KeyResult.objects.filter(objective__workspace__members=self.request.user)
        objective_id = self.request.query_params.get('objective')
        if objective_id:
            qs = qs.filter(objective_id=objective_id)
        return qs
