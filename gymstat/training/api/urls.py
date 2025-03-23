from django.urls import path

from . import views as api_views

app_name = "training"

urlpatterns = [
    path(
        "trainings/",
        api_views.AllTrainingsList.as_view(),
        name="all_trainings",
    ),
    path(
        "trainings/<int:pk>/",
        api_views.GetTraining.as_view(),
        name="get-training",
    ),
    path(
        "trainings/create/",
        api_views.TrainingCreateView.as_view(),
        name="create-training",
    ),
    path(
        "trainings/update/<int:pk>/",
        api_views.TrainingUpdateView.as_view(),
        name="update-training",
    ),
    path(
        "exercises/my/",
        api_views.UserExerciseTypeListView.as_view(),
        name="user-exercise-types",
    ),
    path(
        "exercises/base/",
        api_views.BaseExerciseTypeListView.as_view(),
        name="base-exercise-types",
    ),
    path(
        "exercises/",
        api_views.BaseAndUserExerciseTypeListView.as_view(),
        name="exercise-types",
    ),
    path(
        "exercises/create/",
        api_views.ExerciseTypeCreateView.as_view(),
        name="create-exercise-type",
    ),
]
