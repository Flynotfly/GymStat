from django.contrib import admin

from .models import Training, Exercise


class TrainingInline(admin.StackedInline):
    model = Exercise
    fields = ['order', 'weight', 'repetitions']


@admin.register(Training)
class TrainingAdmin(admin.ModelAdmin):
    list_display = ['owner', 'time', 'description']
    filter = ['owner']
    inlines = [TrainingInline]

