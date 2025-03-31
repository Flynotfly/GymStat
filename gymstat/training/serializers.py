from rest_framework import serializers

from .models import ExerciseTemplate, TrainingTemplate


class ExerciseTemplateSerializer(serializers.ModelSerializer):

    class Meta:
        model = ExerciseTemplate
        fields = [
            "id",
            "name",
            "owner",
            "fields",
            "description",
            "is_admin",
            "is_active",
            "created_at",
            "edited_at",
        ]
        read_only_fields = [
            "id",
            "owner",
            "is_admin",
            "is_active",
            "created_at",
            "edited_at",
        ]
