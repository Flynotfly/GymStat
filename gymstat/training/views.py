from django.contrib.postgres.search import (
    SearchQuery,
    SearchRank,
    SearchVector,
    TrigramSimilarity,
)
from django.db.models import Q
from rest_framework import generics
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated

# from .filters import ExerciseTemplateFilter
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
    # filter_class = ExerciseTemplateFilter

    def get_queryset(self):
        user = self.request.user
        exercise_type = self.request.query_params.get("type", "all")
        _tags = self.request.query_params.get("tags", "").lower()
        _fields = self.request.query_params.get("fields", "").lower()
        search_query = self.request.query_params.get("search", "")
        tags = []
        if _tags:
            tags = _tags.split(",")
        fields = []
        if _fields:
            fields = _fields.split(",")

        queryset = ExerciseTemplate.objects.filter(is_active=True)

        match exercise_type:
            case "user":
                queryset = queryset.filter(owner=user)
            case "admin":
                queryset = queryset.filter(is_admin=True)
            case "all":
                queryset = queryset.filter(Q(owner=user) | Q(is_admin=True))
            case _:
                raise ValidationError(
                    {
                        "type": f"Invalid template type {exercise_type}."
                        f"Allowed only 'user', 'admin', 'all'"
                    }
                )

        for tag in tags:
            queryset = queryset.filter(tags__contains=tag)
        for field in fields:
            queryset = queryset.filter(fields__contains=field)

        if search_query:
            vector = SearchVector("name", weight="A") + SearchVector(
                "description", weight="B"
            )
            query = SearchQuery(search_query)
            queryset = queryset.annotate(rank=SearchRank(vector, query))
            queryset = queryset.annotate(
                similary=TrigramSimilarity("name", search_query)
            )
            queryset = queryset.filter(
                Q(rank__gt=0) | Q(similary__gt=0)
            ).order_by("-rank", "-similary", "name")

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
