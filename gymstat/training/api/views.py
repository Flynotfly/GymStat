from rest_framework.generics import CreateAPIView, ListAPIView, RetrieveAPIView
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q

from ..models import ExerciseType, Training
from .serializers import (
    ExerciseTypeSerializer,
    TrainingOverallSerializer,
    TrainingShortSerializer,
    TrainingCreateSerializer
)


class UserExerciseTypeListView(ListAPIView):
    serializer_class = ExerciseTypeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ExerciseType.objects.filter(owner=self.request.user)


class BaseExerciseTypeListView(ListAPIView):
    serializer_class = ExerciseTypeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ExerciseType.objects.filter(base=True)


class BaseAndUserExerciseTypeListView(ListAPIView):
    serializer_class = ExerciseTypeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ExerciseType.objects.filter(Q(base=True) | Q(owner=self.request.user))


class ExerciseTypeCreateView(CreateAPIView):
    queryset = ExerciseType.objects.all()
    serializer_class = ExerciseTypeSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class TrainingOverallListView(ListAPIView):
    serializer_class = TrainingOverallSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Return only trainings owned by the logged-in user.
        return Training.objects.filter(owner=self.request.user)


class AllTrainingsList(ListAPIView):
    serializer_class = TrainingShortSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Training.objects.filter(owner=self.request.user)


class GetTraining(RetrieveAPIView):
    serializer_class = TrainingOverallSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Training.objects.filter(owner=self.request.user)


class TrainingCreateView(CreateAPIView):
    serializer_class = TrainingCreateSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Training.objects.filter(owner=self.request.user)
