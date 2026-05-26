from django.shortcuts import get_object_or_404
from rest_framework import viewsets, permissions
from apps.workspaces.models import Workspace
from .models import Objective, KeyResult
from .serializers import ObjectiveSerializer, KeyResultSerializer


class ObjectiveViewSet(viewsets.ModelViewSet):
    serializer_class = ObjectiveSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Objective.objects.none()  # placeholder, overridden by get_queryset

    def get_queryset(self):
        return Objective.objects.filter(workspace__members=self.request.user)

    def perform_create(self, serializer):
        # Verify the user is a member of the target workspace before creating.
        # Returns 404 (not 403) to avoid leaking workspace existence.
        workspace_id = self.request.data.get('workspace')
        if workspace_id:
            get_object_or_404(Workspace, id=workspace_id, members=self.request.user)
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

    def perform_create(self, serializer):
        # Verify the target objective belongs to a workspace the user is a member of.
        objective_id = self.request.data.get('objective')
        if objective_id:
            get_object_or_404(
                Objective,
                id=objective_id,
                workspace__members=self.request.user,
            )
        serializer.save()
