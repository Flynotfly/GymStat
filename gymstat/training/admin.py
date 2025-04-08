from django.contrib import admin

from .models import Training, TrainingTemplate, ExerciseTemplate, Exercise


@admin.register(ExerciseTemplate)
class ExerciseTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner', 'is_admin', 'is_active']
    list_filter = ['owner', 'is_admin', 'is_active']
    fields = ['name', 'owner', 'description', 'is_admin', 'is_active', 'fields']
    readonly_fields = ['created_at', 'edited_at']
    search_fields = ['name']


@admin.register(TrainingTemplate)
class TrainingTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'owner']
    list_filter = ['owner']
    fields = ['owner', 'name', 'description', 'data']
    readonly_fields = ['created_at', 'edited_at']
    search_fields = ['name']


class ExerciseInline(admin.TabularInline):
    fields = ["template", "order", "data"]
    model = Exercise
    extra = 1


@admin.register(Training)
class TrainingAdmin(admin.ModelAdmin):
    list_display = ['title', 'owner', 'template']
    list_filter = ['owner']
    fields = ['owner', 'template', 'title', 'conducted', 'notes']
    inlines = [ExerciseInline]
    readonly_fields = ['created_at', 'edited_at']
    search_fields = ['title']
