from rest_framework import serializers

from .models import Metric


class MetricSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source="owner.pk")

