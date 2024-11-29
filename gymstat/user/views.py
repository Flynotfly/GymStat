from django.contrib.auth.decorators import login_required
from django.db import models
from django.shortcuts import render

from training.models import Training, ExerciseType


def training_list(request):
    trainings = Training.objects.filter(owner=request.user)
    return render(
        request,
        'user/trainings.html',
        {
            'trainings': trainings,
        }
    )


@login_required
def dashboard(request):
    return render(
        request,
        'user/dashboard.html',
        {}
    )


@login_required
def user_exercises_list(request):
    exercises = (ExerciseType.objects.filter(
        models.Q(owner=request.user) | models.Q(subscribers=request.user)
    ).distinct())

    return render(
        request,
        'user/exercises.html',
        {
            'exercises': exercises,
            'user': request.user,
        }
    )
