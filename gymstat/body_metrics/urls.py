from django.urls import include, path

from . import views

app_name = "user"

urlpatterns = [
    path(
        "metrics/",
        views.MetricListCreateAPIView.as_view(),
        name="get-create-metrics",
    ),
    path(
        "metrics/<int:pk>/",
        views.MetricRetrieveUpdateDestroyAPIView.as_view(),
        name="get-edit-metric",
    ),
    path(
        "records/",
        views.RecordListCreateAPIView.as_view(),
        name="get-create-records",
    ),
    path(
        "records/<int:pk>/",
        views.RecordRetrieveUpdateDestroyAPIView.as_view(),
        name="get-edit-record",
    ),
]
