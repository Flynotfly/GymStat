from django.urls import path
from . import views

app_name = 'training'

urlpatterns = [
    path('create/', views.training_edit, name='create'),
    path('<int:pk>/edit/', views.training_edit, name='edit'),

    path('exercise/<int:pk>/', views.exercise_details, name='exercise_detail'),
    path('exercise/create/', views.create_exercise, name='exercise_create'),
    path('exercise/<int:pk>/edit/', views.create_exercise, name='exercise_edit'),
]
