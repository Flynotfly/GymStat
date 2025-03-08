from django.db.models import Max
from rest_framework import serializers

from ..models import Exercise, Training, ExerciseType


class ExerciseTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExerciseType
        fields = ['id', 'name', 'description', 'iconId', 'iconColor']
        read_only_fields = ['id']


class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = ["exercise_type", "order", "weight", "repetitions"]


class TrainingSerializer(serializers.ModelSerializer):
    exercises = ExerciseSerializer(many=True)

    class Meta:
        model = Training
        fields = ["conducted", "description", "exercises"]


class TrainingSummarySerializer(serializers.ModelSerializer):
    date = serializers.SerializerMethodField()
    time = serializers.SerializerMethodField()
    quantity_exercises = serializers.SerializerMethodField()
    max_weight = serializers.SerializerMethodField()
    max_repetitions = serializers.SerializerMethodField()

    class Meta:
        model = Training
        fields = [
            "id",
            "date",
            "time",
            "title",
            "duration",
            "quantity_exercises",
            "max_weight",
            "max_repetitions",
        ]

    def get_date(self, obj):
        return obj.conducted.strftime("%Y-%m-%d") if obj.conducted else None

    def get_time(self, obj):
        return obj.conducted.strftime("%H:%S") if obj.conducted else None

    def get_quantity_exercises(self, obj):
        return obj.exercises.count()

    # TODO: optimise get_max_weight and get_max_repetitions
    def get_max_weight(self, obj):
        exercise_type_id = self.context.get("exercise_type_id")
        if not exercise_type_id:
            return None

        exercises = obj.exercises.filter(exercise_type__id=exercise_type_id)
        if not exercises.exists():
            return None
        max_weight = exercises.aggregate(max_weight=Max("weight"))[
            "max_weight"
        ]
        return max_weight

    def get_max_repetitions(self, obj):
        max_weight = self.get_max_weight(obj)
        if not max_weight:
            return None

        exercise_type_id = self.context.get("exercise_type_id")
        exercises = obj.exercises.filter(exercise_type__id=exercise_type_id)
        max_repetitions = exercises.filter(weight=max_weight).aggregate(
            max_repetitions=Max("repetitions")
        )["max_repetitions"]
        return max_repetitions
