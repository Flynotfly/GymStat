from rest_framework import serializers

from .models import Exercise, ExerciseTemplate, Training, TrainingTemplate


class ExerciseTemplateSerializer(serializers.ModelSerializer):

    class Meta:
        model = ExerciseTemplate
        fields = [
            "id",
            "owner",
            "name",
            "fields",
            "tags",
            "description",
            "is_admin",
        ]
        read_only_fields = [
            "id",
            "is_admin",
            "owner",
        ]


class TrainingTemplateSerializer(serializers.ModelSerializer):

    class Meta:
        model = TrainingTemplate
        fields = [
            "id",
            "name",
            "description",
            "data",
        ]


class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = ["id", "training", "template", "order", "data"]
        read_only_fields = ["id", "training"]


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
            "exercises",
        ]
        read_only_fields = ["id", "owner"]

    def create(self, validated_data):
        return Training.objects.create_training(
            owner=validated_data.get("owner"),
            conducted=validated_data.get("conducted"),
            template=validated_data.get("template"),
            title=validated_data.get("title"),
            notes=validated_data.get("notes"),
            exercises_data=validated_data.get("exercises"),
        )
