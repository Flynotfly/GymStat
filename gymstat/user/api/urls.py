from django.urls import path

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from . import views as api_views

app_name = 'user'

urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token-email/', api_views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('set-token/', api_views.SetTokenObtainPairView.as_view(), name='set_token'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
