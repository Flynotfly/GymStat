from datetime import datetime
from itertools import groupby

from django.db.models import Max
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from ..models import Exercise, ExerciseType, Training


class TrainingShortSerializer(serializers.ModelSerializer):
    date = serializers.SerializerMethodField()
    time = serializers.SerializerMethodField()

    class Meta:
        model = Training
        fields = ("id", "title", "date", "time")

    def get_date(self, obj):
        # Returns the date part of the conducted datetime as ISO string.
        return obj.conducted.date().isoformat()

    def get_time(self, obj):
        # Returns the time part of the conducted datetime as ISO string.
        return obj.conducted.time().isoformat(timespec="seconds")


class TrainingOverallSerializer(serializers.ModelSerializer):
    date = serializers.SerializerMethodField()
    time = serializers.SerializerMethodField()
    sets = serializers.SerializerMethodField()

    class Meta:
        model = Training
        fields = (
            "id",
            "date",
            "time",
            "title",
            "description",
            "score",
            "sets",
        )

    def get_date(self, obj):
        # Returns the date part of the conducted datetime as ISO string.
        return obj.conducted.date().isoformat()

    def get_time(self, obj):
        # Returns the time part of the conducted datetime as ISO string.
        return obj.conducted.time().isoformat(timespec="seconds")

    def get_sets(self, obj):
        # Get the exercises for this training.
        # Assumes that the default ordering on Exercise (by order, then suborder)
        # groups exercises of the same set together.
        exercises = obj.exercises.all()
        sets = []
        # Group exercises by the "order" field.
        for order, group in groupby(exercises, key=lambda ex: ex.order):
            group_list = list(group)
            # Assume that all exercises in the same set share the same exercise_type.
            exercise_type = group_list[0].exercise_type
            sets.append(
                {
                    "index": order,
                    "exerciseType": exercise_type.id if exercise_type else None,
                    "exerciseName": exercise_type.name if exercise_type else None,
                    "exercises": [
                        {
                            "index": ex.suborder,
                            "repetitions": ex.repetitions,
                            "weight": ex.weight,
                        }
                        for ex in group_list
                    ],
                }
            )
        return sets


class ExerciseTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExerciseType
        fields = ["id", "name", "description", "iconId", "iconColor"]
        read_only_fields = ["id"]


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


# Serializer for each exercise inside a set
class ExerciseInSetSerializer(serializers.Serializer):
    index = serializers.IntegerField()
    repetitions = serializers.IntegerField()
    weight = serializers.DecimalField(max_digits=6, decimal_places=2)


# Serializer for each training set (which groups one or more exercises)
class TrainingSetSerializer(serializers.Serializer):
    index = serializers.IntegerField()
    exerciseType = serializers.IntegerField()  # ID of ExerciseType
    exerciseName = serializers.CharField()       # Provided for UI purposes (not stored)
    exercises = ExerciseInSetSerializer(many=True)


class TrainingCreateSerializer(serializers.Serializer):
    title = serializers.CharField(allow_blank=True, required=False)
    description = serializers.CharField(allow_blank=True, required=False)
    score = serializers.IntegerField()
    date = serializers.DateField()  # Separate date field
    time = serializers.TimeField()  # Separate time field
    sets = TrainingSetSerializer(many=True)

    def validate(self, data):
        request = self.context.get("request")
        if not request:
            raise ValidationError("Request context is required.")
        # Validate each training set's exercise type
        for set_data in data.get("sets", []):
            exercise_type_id = set_data.get("exerciseType")
            try:
                et = ExerciseType.objects.get(id=exercise_type_id)
            except ExerciseType.DoesNotExist:
                raise ValidationError(f"ExerciseType with id {exercise_type_id} does not exist")
            # Check that the current user is the owner or the type is base
            if not (et.base or et.owner == request.user):
                raise ValidationError(f"Not authorized to use ExerciseType id {exercise_type_id}")
        return data

    def create(self, validated_data):
        sets_data = validated_data.pop('sets')
        date_field = validated_data.pop("date")
        time_field = validated_data.pop("time")
        # Combine date and time into one datetime for Training.conducted
        conducted_datetime = datetime.combine(date_field, time_field)
        # Create the Training instance
        training = Training.objects.create(
            owner=self.context['request'].user,
            conducted=conducted_datetime,
            **validated_data
        )
        # Create each Exercise entry from the provided sets
        for set_data in sets_data:
            order = set_data['index']
            exercise_type_id = set_data['exerciseType']
            for exercise in set_data['exercises']:
                Exercise.objects.create(
                    training=training,
                    exercise_type_id=exercise_type_id,
                    order=order,
                    suborder=exercise['index'],
                    weight=exercise['weight'],
                    repetitions=exercise['repetitions']
                )
        return training
