from rest_framework import serializers

from .models import Exercise, ExerciseTemplate, Training, TrainingTemplate


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


class TrainingTemplateSerializer(serializers.ModelSerializer):

    class Meta:
        model = TrainingTemplate
        fields = [
            "id",
            "owner",
            "name",
            "description",
            "data",
            "created_at",
            "edited_at",
        ]
        read_only_fields = ["id", "owner", "created_at", "edited_at"]


class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = ["id", "training", "template", "order", "data"]


class TrainingSerializer(serializers.ModelSerializer):
    exercises = ExerciseSerializer(required=False, many=True)

    class Meta:
        model = Training
        fields = [
            "id",
            "owner",
            "template",
            "conducted",
            "title",
            "notes",
            "created_at",
            "edited_at",
            "exercises",
        ]
        read_only_fields = ["id", "owner", "created_at", "edited_at"]

    def create(self, validated_data):
        return Training.objects.create_training(
            owner=validated_data.get("owner"),
            conducted=validated_data.get("conducted"),
            template_id=validated_data.get("template"),
            title=validated_data.get("title"),
            notes=validated_data.get("notes"),
            exercises_data=validated_data.get("exercises"),
        )
