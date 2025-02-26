from django.urls import path

from . import views as api_views

app_name = "training"

urlpatterns = [
    path(
        "last-training/",
        api_views.LastTrainingAPIView.as_view(),
        name="last_training",
    ),
    path(
        "all-trainings/",
        api_views.GetAllTrainingsAPIView.as_view(),
        name="all_trainings",
    ),
]
