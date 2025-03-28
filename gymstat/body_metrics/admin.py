from django.contrib import admin

from .models import Record, Metric


@admin.register(Metric)
class MetricAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'owner', 'unit', 'admin')
    search_fields = ('name', 'description', 'owner__username')
    list_filter = ('admin', 'created_at')
    ordering = ('name',)


@admin.register(Record)
class RecordAdmin(admin.ModelAdmin):
    list_display = ('id', 'owner', 'metric', 'value', 'datetime')
    search_fields = ('metric__name', 'owner__username')
    list_filter = ('datetime', 'metric')
    ordering = ('datetime',)
