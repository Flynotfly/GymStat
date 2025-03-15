from django.urls import path

from . import views as api_views

app_name = "training"

urlpatterns = [
    # path(
    #     "last-training/",
    #     api_views.LastTrainingAPIView.as_view(),
    #     name="last_training",
    # ),
    path(
        "all-trainings/",
        api_views.AllTrainingsList.as_view(),
        name="all_trainings",
    ),
    path("training/<int:pk>/", api_views.GetTraining.as_view(), name="get-training"),
    path(
        "my-exercises/",
        api_views.UserExerciseTypeListView.as_view(),
        name="user-exercise-types",
    ),
    path(
        "base-exercises/",
        api_views.BaseExerciseTypeListView.as_view(),
        name="base-exercise-types",
    ),
    path("exercises/", api_views.BaseAndUserExerciseTypeListView.as_view(), name="exercise-types"),
    path(
        "create-exercise-type/",
        api_views.ExerciseTypeCreateView.as_view(),
        name="create-exercise-type",
    ),
]
