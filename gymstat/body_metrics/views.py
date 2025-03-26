from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.db.models import Q
from .models import Metric
from .permissions import IsOwner
from .serializers import MetricSerializer


class MetricListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = MetricSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        metric_type = self.request.query_params.get('type', 'all')

        if metric_type == 'user':
            return Metric.objects.filter(owner=user)
        elif metric_type == 'admin':
            return Metric.objects.filter(admin=True)
        elif metric_type == 'all':
            return Metric.objects.filter(Q(owner=user) | Q(admin=True))
        else:
            return Metric.objects.none()

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class MetricRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MetricSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        user = self.request.user
        return Metric.objects.filter(Q(owner=user) | Q(admin=True))
