from django.urls import path
from . import views

app_name = 'training'

urlpatterns = [
    path('create/', views.training_details, name='create'),
    path('<int:pk>/edit/', views.training_details, name='edit'),
]
