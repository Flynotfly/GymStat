"""
URL configuration for gymstat project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("user/", include("user.urls", namespace="user")),
    path("training/", include("training.urls", namespace="training")),
    path("metrics/", include("body_metrics.urls", namespace="metrics")),
    path("accounts/", include("allauth.urls")),
    path("_allauth/", include("allauth.headless.urls")),
    path("__debug__", include("debug_toolbar.urls")),
]

if settings.DEBUG:
    urlpatterns += static(
        settings.STATIC_URL, document_root=settings.STATIC_ROOT
    )

    from drf_spectacular.views import SpectacularRedocView, SpectacularAPIView

    urlpatterns.append(path('api/schema/', SpectacularAPIView.as_view(), name='schema'))
    urlpatterns.append(path('api/schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'))
