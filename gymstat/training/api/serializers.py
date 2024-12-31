from rest_framework import serializers

from ..models import Training, Exercise


class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = ['exercise_type', 'order', 'weight', 'repetitions']


class TrainingSerializer(serializers.ModelSerializer):
    exercises = ExerciseSerializer(many=True)

    class Meta:
        model = Training
        fields = ['conducted', 'description', 'exercises']
