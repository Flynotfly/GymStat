from django.urls import include, path

from . import views

app_name = "training"

urlpatterns = [
    path('exercises/', views.ExerciseTemplateListCreateAPIView.as_view(), name="exercises"),
#     path('exercises/<int:pk>/', ..., name="exercise"),
]
