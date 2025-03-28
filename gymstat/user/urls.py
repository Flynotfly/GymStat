from django.urls import path

from . import views

app_name = "user"

urlpatterns = [
    path("csrf/", views.CsrfTokenAPIView.as_view(), name="csrf"),
]
