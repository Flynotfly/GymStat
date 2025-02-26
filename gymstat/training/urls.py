from django.urls import include, path

from . import views
from .api import urls as api_urls

app_name = "training"

urlpatterns = [
    path("api/", include(api_urls, namespace="api")),
    path("<int:pk>/", views.training_details, name="details"),
    path("create/", views.training_edit, name="create"),
    path("<int:pk>/edit/", views.training_edit, name="edit"),
    path("post/<int:pk>/delete/", views.training_delete, name="delete"),
    path("exercise/<int:pk>/", views.exercise_details, name="exercise_detail"),
    path("exercise/create/", views.create_exercise, name="exercise_create"),
    path("exercise/<int:pk>/edit/", views.create_exercise, name="exercise_edit"),
]
