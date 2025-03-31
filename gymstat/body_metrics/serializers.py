from rest_framework import serializers

from .models import Metric, Record


class MetricSerializer(serializers.ModelSerializer):

    class Meta:
        model = Metric
        fields = ["id", "owner", "name", "unit", "description", "admin", "created_at", "edited_at"]
        read_only_fields = ["id", "owner", "admin", "created_at", "edited_at"]


class RecordSerializer(serializers.ModelSerializer):

    class Meta:
        model = Record
        fields = ["id", "metric", "value", "datetime", "created_at"]
        read_only_fields = ["id", "owner", "created_at"]
