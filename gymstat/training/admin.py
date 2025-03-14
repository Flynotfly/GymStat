# admin.py
from django.contrib import admin

from .models import Exercise, ExerciseType, Training


class ExerciseInline(admin.TabularInline):
    model = Exercise
    extra = 1
    ordering = ("order", "suborder")


@admin.register(Training)
class TrainingAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "conducted", "score", "owner")
    list_filter = ("conducted", "owner")
    search_fields = ("title", "description")
    inlines = [ExerciseInline]


@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "training",
        "exercise_type",
        "order",
        "suborder",
        "weight",
        "repetitions",
    )
    list_filter = ("training", "exercise_type")
    search_fields = ("training__title",)


@admin.register(ExerciseType)
class ExerciseTypeAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "owner", "base")
    search_fields = ("name",)
