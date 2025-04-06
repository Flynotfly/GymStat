from django.urls import include, path

from . import views

app_name = "training"

urlpatterns = [
    path(
        "exercises/",
        views.ExerciseTemplateListCreateAPIView.as_view(),
        name="exercise-template-list-create",
    ),
    path(
        "exercises/<int:pk>/",
        views.ExerciseTemplateRetrieveUpdateDestroyAPIView.as_view(),
        name="exercise-template-detail",
    ),
    path(
        "trainings/templates/",
        views.TrainingTemplateListCreateAPIView.as_view(),
        name="training-template-list-create",
    ),
    path(
        "trainings/templates/<int:pk>/",
        views.TrainingTemplateRetrieveUpdateDestroyAPIView.as_view(),
        name="training-template-detail",
    ),
    path(
        "trainings/",
        views.TrainingListCreateAPIView.as_view(),
        name="training-list-create",
    ),
    path(
        "trainings/<int:pk>/",
        views.TrainingRetrieveUpdateDestroyAPIView.as_view(),
        name="training-detail",
    ),
]
