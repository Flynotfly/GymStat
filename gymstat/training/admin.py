from django.contrib import admin

from .models import Exercise, ExerciseType, Training


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
    list_display = ["owner", "name", "base"]
    list_filter = ["owner", "base"]
