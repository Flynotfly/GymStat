from django.urls import include, path

from . import views

app_name = "training"

urlpatterns = [
    path('exercises/', views.ExerciseTemplateListCreateAPIView.as_view(), name="exercises-template-list-create"),
    path('exercises/<int:pk>/', views.ExerciseTemplateRetrieveUpdateDestroyAPIView.as_view(), name="exercise-template-detail"),
]
