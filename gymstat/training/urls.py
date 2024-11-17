from django.urls import path
from .views import TrainingCreateUpdateView

app_name = 'training'

urlpatterns = [
    path('create/', TrainingCreateUpdateView.as_view(), name='create'),
    path('<int:pk>/edit/', TrainingCreateUpdateView.as_view(), name='edit'),
]