from django.contrib.auth import views as auth_views
from django.urls import path

from . import views

app_name = 'user'

urlpatterns = [
    path('login/', auth_views.LoginView.as_view(), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('trainings/', views.training_list, name='trainings'),
    path('exercises/', views.exercises_list, name='exercises'),
    path('post/bookmark/exercise/', views.bookmark_exercise, name='bookmark_exercise'),
    path('', views.dashboard, name='dashboard'),
]
