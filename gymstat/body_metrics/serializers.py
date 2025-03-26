from rest_framework import serializers

from .models import Metric, Record


class MetricSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source="owner.pk")

    class Meta:
        model = Metric
        fields = '__all__'
        read_only_fields = ('owner', 'admin', 'created_at', 'edited_at')


class RecordSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.pk')

    class Meta:
        model = Record
        fields = '__all__'
        read_only_fields = ('owner', 'created_at')
