from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db import models
from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404

from training.models import Training, ExerciseType


@login_required
def training_list(request):
    trainings = Training.objects.filter(owner=request.user)
    paginator = Paginator(trainings, 10)

    page_number = request.GET.get("page")
    paje_obj = paginator.get_page(page_number)
    return render(
        request,
        "user/trainings.html",
        {
            "page_obj": paje_obj,
        },
    )


@login_required
def dashboard(request):
    return render(request, "user/dashboard.html", {})


@login_required
def exercises_list(request):
    mode = request.GET.get("mode", "bookmarked")

    if mode == "bookmarked":
        exercises = ExerciseType.objects.filter(bookmarked=request.user)
    elif mode == "created":
        exercises = ExerciseType.objects.filter(owner=request.user)
    elif mode == "public":
        exercises = ExerciseType.objects.filter(private=False)
    else:
        exercises = ExerciseType.objects.filter(base=True)

    paginator = Paginator(exercises, 10)

    page_number = request.GET.get("page")
    paje_obj = paginator.get_page(page_number)

    return render(
        request,
        "user/exercises.html",
        {
            "page_obj": paje_obj,
            "user": request.user,
            "mode": mode,
        },
    )


@login_required
def bookmark_exercise(request):
    exercise_id = request.POST.get("id")
    action = request.POST.get("action")

    if exercise_id and action:
        try:
            exercise = ExerciseType.objects.get(id=exercise_id)
            if action == "book":
                exercise.bookmarked.add(request.user)
            else:
                exercise.bookmarked.remove(request.user)
            return JsonResponse({"success": True})
        except ExerciseType.DoesNotExist:
            JsonResponse(
                {
                    "success": False,
                    "errors": "Invalid exercise id",
                }
            )
    return JsonResponse(
        {
            "success": False,
            "errors": "Server error",
        }
    )


@login_required
def exercise_type_statistic(request):
    exercise_types = ExerciseType.objects.filter(bookmarked=request.user)
    exercise_type_id = request.GET.get("exercise_type")
    exercise_type = None
    training_with_exercises = []

    if exercise_type_id:
        exercise_type = get_object_or_404(
            ExerciseType, id=exercise_type_id, bookmarked=request.user
        )
        training_with_exercises = (
            Training.objects.filter(
                owner=request.user, exercises__exercise_type=exercise_type
            )
            .prefetch_related("exercises")
            .distinct()
        )

    return render(
        request,
        "user/statistic/by_exercise_type.html",
        {
            "exercise_types": exercise_types,
            "selected_exercise_type": exercise_type,
            "trainings_with_exercises": training_with_exercises,
        },
    )
