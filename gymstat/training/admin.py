from django.contrib import admin

from .models import Training, Exercise, ExerciseType


class TrainingInline(admin.StackedInline):
    model = Exercise
    fields = ["order", "weight", "repetitions"]


@admin.register(Training)
class TrainingAdmin(admin.ModelAdmin):
    list_display = ["owner", "conducted", "description"]
    filter = ["owner"]
    inlines = [TrainingInline]


@admin.register(ExerciseType)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ["owner", "name", "private"]
    filter = ["owner", "private"]
