from django.contrib.auth.decorators import login_required
from django.core.exceptions import PermissionDenied
from django.db import models
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render, redirect
from django.views.decorators.http import require_POST

from .models import Training, ExerciseType
from .forms import TrainingForm, ExerciseFormSet, ExerciseTypeForm


@login_required
def training_edit(request, pk=None):
    if pk:
        training = get_object_or_404(Training, pk=pk, owner=request.user)
    else:
        training = None

    if request.method == 'POST':
        training_form = TrainingForm(request.POST, instance=training)
        exercise_formset = ExerciseFormSet(
            request.POST,
            instance=training,
            form_kwargs={'user': request.user}
        )
        if training_form.is_valid() and exercise_formset.is_valid():
            training = training_form.save(commit=False)
            if not training.pk:  # Only set the owner for new training instances
                training.owner = request.user
            training.save()
            exercise_formset.instance = training
            exercise_formset.save()
            return redirect(training)

    training_form = TrainingForm(instance=training)
    exercise_formset = ExerciseFormSet(
        instance=training,
        form_kwargs={'user': request.user}
    )

    return render(
        request,
        'training/edit.html',
        {
            'training': training,
            'training_form': training_form,
            'exercise_formset': exercise_formset,
        }
    )


@login_required
def training_details(request, pk):
    training = get_object_or_404(
        Training,
        pk=pk,
        owner=request.user
    )
    return render(
        request,
        'training/view.html',
        {
            'training': training,
        }
    )


@require_POST
@login_required
def training_delete(request, pk):
    training = get_object_or_404(Training, pk=pk, owner=request.user)
    training.delete()
    return redirect('user:trainings')


@login_required
def create_exercise(request, pk=None):
    if pk:
        exercise = get_object_or_404(ExerciseType, pk=pk)
        if exercise.owner != request.user and exercise.private:
            raise PermissionDenied("You don't have permission to edit exercise")
    else:
        exercise = None

    if request.method == 'POST':
        exercise_form = ExerciseTypeForm(request.POST, instance=exercise)
        if exercise_form.is_valid():
            exercise = exercise_form.save(commit=False)
            if not exercise.pk:
                exercise.owner = request.user
            exercise.save()
            return redirect(exercise)

    exercise_form = ExerciseTypeForm(instance=exercise)
    return render(
        request,
        'exercise/edit.html',
        {
            'exercise': exercise,
            'exercise_form': exercise_form,
        }
    )


def exercise_details(request, pk):
    user = None
    if request.user.is_authenticated:
        user = request.user

    exercise = get_object_or_404(
        ExerciseType,
        models.Q(pk=pk) & (models.Q(private=False) | models.Q(owner=user))
    )
    return render(
        request,
        'exercise/view.html',
        {
            'exercise': exercise,
        }
    )
