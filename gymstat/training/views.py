from django.db.models import Q
from rest_framework import generics, permissions

from .models import ExerciseTemplate
from .serializers import ExerciseTemplateSerializer
from .permissions import IsOwnerAllIsAdminSafe


class ExerciseTemplateListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = ExerciseTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        exercise_type = self.request.query_params.get("type", "all")

        if exercise_type == "user":
            return ExerciseTemplate.objects.filter(owner=user, is_active=True)
        elif exercise_type == "admin":
            return ExerciseTemplate.objects.filter(is_admin=True, is_active=True)
        elif exercise_type == "all":
            return ExerciseTemplate.objects.filter(Q(owner=user) | Q(is_admin=True), is_active=True)
        else:
            return ExerciseTemplate.objects.none()

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class ExerciseTemplateRetrieveUpdateDestroyAPIView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = ExerciseTemplateSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerAllIsAdminSafe]

    def get_queryset(self):
        user = self.request.user
        return ExerciseTemplate.objects.filter(Q(owner=user) | Q(is_admin=True), is_active=True)
