from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from django.db.models import Q
from .models import Metric, Record
from .permissions import IsOwner, IsOwnerAllIsAdminSafe
from .serializers import MetricSerializer, RecordSerializer


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
    permission_classes = [permissions.IsAuthenticated, IsOwnerAllIsAdminSafe]

    def get_queryset(self):
        user = self.request.user
        return Metric.objects.filter(Q(owner=user) | Q(admin=True))


class RecordListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = RecordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        metric_id = self.request.query_params.get('metric')

        if not metric_id:
            raise ValidationError({"metric": "This query parameter is required."})

        # Verify metric exists and user can access it
        try:
            metric = Metric.objects.get(
                Q(pk=metric_id),
                Q(owner=user) | Q(admin=True)
            )
        except Metric.DoesNotExist:
            raise PermissionDenied("You do not have access to this metric.")

        return Record.objects.filter(owner=user, metric=metric)

    def perform_create(self, serializer):
        user = self.request.user
        metric = serializer.validated_data['metric']

        # Check if metric is accessible (user-owned or admin)
        if not (metric.admin or metric.owner == user):
            raise PermissionDenied("Cannot create record for unauthorized metric.")

        serializer.save(owner=user)


class RecordRetrieveUpdateDestroyAPIView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = RecordSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Record.objects.filter(owner=self.request.user)
