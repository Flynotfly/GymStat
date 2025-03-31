from django.db.models import Q
from rest_framework import generics, permissions

from .models import ExerciseTemplate, TrainingTemplate
from .permissions import IsOwner, IsAdminReadOnly
from .serializers import ExerciseTemplateSerializer, TrainingTemplateSerializer


class ExerciseTemplateListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = ExerciseTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        exercise_type = self.request.query_params.get("type", "all")

        if exercise_type == "user":
            return ExerciseTemplate.objects.filter(owner=user, is_active=True)
        elif exercise_type == "admin":
            return ExerciseTemplate.objects.filter(
                is_admin=True, is_active=True
            )
        elif exercise_type == "all":
            return ExerciseTemplate.objects.filter(
                Q(owner=user) | Q(is_admin=True), is_active=True
            )
        else:
            return ExerciseTemplate.objects.none()

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class ExerciseTemplateRetrieveUpdateDestroyAPIView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = ExerciseTemplateSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner|IsAdminReadOnly]
    queryset = ExerciseTemplate.objects.filter(is_active=True)


class TrainingTemplateListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = TrainingTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TrainingTemplate.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class TrainingTemplateRetrieveUpdateDestroyAPIView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = TrainingTemplateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TrainingTemplate.objects.filter(owner=self.request.user)
