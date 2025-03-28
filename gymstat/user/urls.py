from django.contrib.auth import views as auth_views
from django.urls import include, path

from . import views

app_name = "user"

urlpatterns = [
    path("csrf/", views.CsrfTokenAPIView.as_view(), name="csrf"),
]
