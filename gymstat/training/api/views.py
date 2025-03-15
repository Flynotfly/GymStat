from rest_framework import status
from rest_framework.generics import CreateAPIView, ListAPIView, RetrieveAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from ..models import ExerciseType, Training
from .serializers import (
    ExerciseTypeSerializer,
    TrainingOverallSerializer,
    TrainingSerializer,
    TrainingShortSerializer,
    TrainingSummarySerializer,
)


class UserExerciseTypeListView(ListAPIView):
    serializer_class = ExerciseTypeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ExerciseType.objects.filter(owner=self.request.user)


class BaseExerciseTypeListView(ListAPIView):
    serializer_class = ExerciseTypeSerializer
    permission_classes = [IsAuthenticated]  # Adjust permission as needed

    def get_queryset(self):
        return ExerciseType.objects.filter(base=True)


class ExerciseTypeCreateView(CreateAPIView):
    queryset = ExerciseType.objects.all()
    serializer_class = ExerciseTypeSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


# class LastTrainingAPIView(APIView):
#     permission_classes = [IsAuthenticated]
#
#     def get(self, request):
#         last_training = Training.objects.filter(owner=request.user).first()
#         if not last_training:
#             return Response(
#                 {"error": "No previous training found"},
#                 status=status.HTTP_404_NOT_FOUND,
#             )
#
#         serializer = TrainingSerializer(last_training)
#         return Response(serializer.data)


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


# class GetAllTrainingsAPIView(APIView):
#     permission_classes = [IsAuthenticated]
#
#     def get(self, request):
#         trainings = Training.objects.filter(owner=request.user)
#         if not trainings.exists():
#             return Response(
#                 {'error': 'No trainings found'},
#                 status=status.HTTP_404_NOT_FOUND
#             )
#
#         serializer = TrainingSerializer(trainings, many=True)
#         return Response(serializer.data)

#
# class GetAllTrainingsAPIView(APIView):
#     permission_classes = [IsAuthenticated]
#
#     def get(self, request):
#         exercise_type_id = request.GET.get("exercise_type")
#         if not exercise_type_id:
#             return Response(
#                 {"error": "No exercise type id provided"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )
#         try:
#             exercise_type_id = int(exercise_type_id)
#         except ValueError:
#             return Response(
#                 {"error": "Invalid exercise type id"},
#                 status=status.HTTP_400_BAD_REQUEST,
#             )
#
#         trainings = Training.objects.filter(owner=request.user).all()
#         if not trainings.exists():
#             return Response(
#                 {"error": "No trainings found"},
#                 status=status.HTTP_404_NOT_FOUND,
#             )
#
#         serializer = TrainingSummarySerializer(
#             trainings,
#             many=True,
#             context={"exercise_type_id": exercise_type_id},
#         )
#
#         return Response(serializer.data, status=status.HTTP_200_OK)
