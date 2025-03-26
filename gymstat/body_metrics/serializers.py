from rest_framework import serializers

from .models import Metric


class MetricSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source="owner.pk")

    class Meta:
        model = Metric
        fields = '__all__'
        read_only_fields = ('owner', 'admin', 'created_at', 'edited_at')

