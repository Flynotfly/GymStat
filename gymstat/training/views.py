from django.contrib.postgres.search import SearchVector
from django.db.models import Q
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .filters import ExerciseTemplateFilter
from .models import ExerciseTemplate, Training, TrainingTemplate
from .permissions import IsAdminObjectReadOnly, IsOwner
from .serializers import (
    ExerciseTemplateSerializer,
    TrainingSerializer,
    TrainingTemplateSerializer,
)


class ExerciseTemplateListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = ExerciseTemplateSerializer
    permission_classes = [IsAuthenticated]
    filter_class = ExerciseTemplateFilter

    def get_queryset(self):
        user = self.request.user
        search_query = self.request.query_params.get("search", "")
        queryset = ExerciseTemplate.objects.all()
        if search_query:
            queryset = queryset.annotate(
                search=SearchVector("name", weight="A")
                + SearchVector("description", weight="B")
            ).filter(search=search_query)

        queryset = self.filter_class(
            queryset=queryset, request=self.request
        ).qs
        return queryset

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class ExerciseTemplateRetrieveUpdateDestroyAPIView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = ExerciseTemplateSerializer
    permission_classes = [IsAuthenticated, IsOwner | IsAdminObjectReadOnly]
    queryset = ExerciseTemplate.objects.filter(is_active=True)


class TrainingTemplateListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = TrainingTemplateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return TrainingTemplate.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class TrainingTemplateRetrieveUpdateDestroyAPIView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = TrainingTemplateSerializer
    permission_classes = [IsAuthenticated, IsOwner]
    queryset = TrainingTemplate.objects.all()


class TrainingListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = TrainingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Training.objects.prefetch_related("exercises").filter(
            owner=self.request.user
        )

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class TrainingRetrieveUpdateDestroyAPIView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = TrainingSerializer
    permission_classes = [IsAuthenticated, IsOwner]
    queryset = Training.objects.prefetch_related("exercises").all()
