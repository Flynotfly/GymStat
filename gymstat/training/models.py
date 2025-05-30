from django.conf import settings
from django.contrib.postgres.indexes import GinIndex
from django.contrib.postgres.search import SearchVector
from django.core.exceptions import ValidationError
from django.db import models

from .constants import ALLOWED_EXERCISE_FIELDS
from .managers import TrainingManager
from .validators import (
    validate_exercise_sets,
    validate_exercise_template_fields,
    validate_exercise_template_tags,
    validate_exercise_units,
    validate_training_notes,
    validate_training_template_data,
)


class TrainingTemplate(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="training_templates",
        on_delete=models.CASCADE,
    )
    name = models.CharField(max_length=70)
    description = models.TextField(blank=True, null=True)
    data = models.JSONField(
        validators=[validate_training_template_data], blank=True, default=dict
    )
    created_at = models.DateTimeField(auto_now_add=True)
    edited_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["name"]),
            models.Index(fields=["owner", "name"]),
            GinIndex(
                name="training_template_data",
                fields=["data"],
                opclasses=["jsonb_path_ops"],
            ),
        ]
        ordering = ["name"]

    def __str__(self):
        return self.name

    def __repr__(self):
        return f"Training template {self.pk} {self.name} of user {self.owner}"


class Training(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="trainings",
        on_delete=models.CASCADE,
    )
    template = models.ForeignKey(
        TrainingTemplate,
        related_name="trainings",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
    )
    conducted = models.DateTimeField()
    title = models.CharField(max_length=70, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    notes = models.JSONField(
        validators=[validate_training_notes],
        blank=True,
        null=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    edited_at = models.DateTimeField(auto_now=True)

    objects = TrainingManager()

    class Meta:
        indexes = [
            models.Index(fields=["-conducted"]),
            models.Index(fields=["owner", "-conducted"]),
            GinIndex(
                name="training_notes",
                fields=["notes"],
                opclasses=["jsonb_path_ops"],
            ),
        ]
        ordering = ["-conducted"]

    def __str__(self):
        return f"{self.title or 'Untitled Training'} by {self.owner} on {self.conducted.strftime('%Y-%m-%d')}"

    def __repr__(self):
        return (
            f"<Training(id={self.id}, title={self.title!r}, owner={self.owner!r}, "
            f"conducted={self.conducted.isoformat()})>"
        )


class ExerciseTemplate(models.Model):
    name = models.CharField(max_length=50)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="exercise_templates",
        on_delete=models.CASCADE,
    )
    fields = models.JSONField(validators=[validate_exercise_template_fields])
    tags = models.JSONField(
        validators=[validate_exercise_template_tags],
        blank=True,
        null=True,
    )
    description = models.TextField(blank=True, null=True)
    is_admin = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    edited_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["name"]),
            models.Index(fields=["is_active", "name"]),
            models.Index(fields=["is_active", "is_admin", "name"]),
            GinIndex(
                name="exercise_templates_fields",
                fields=["fields"],
                opclasses=["jsonb_path_ops"],
            ),
            GinIndex(
                SearchVector("name", "description", config="english"),
                name="et_search_vector",
            ),
        ]
        ordering = ["name"]

    def __str__(self):
        return self.name

    def __repr__(self):
        return f"Exercise {'admin' if self.is_admin else 'user'} template {self.pk} {self.name}"


class Exercise(models.Model):
    training = models.ForeignKey(
        Training, related_name="exercises", on_delete=models.CASCADE
    )
    template = models.ForeignKey(
        ExerciseTemplate,
        related_name="exercises",
        on_delete=models.CASCADE,
    )
    order = models.PositiveIntegerField()
    units = models.JSONField(
        validators=[validate_exercise_units], blank=True, null=True
    )
    sets = models.JSONField(
        validators=[validate_exercise_sets], blank=True, null=True
    )

    class Meta:
        indexes = [
            models.Index(fields=["order"]),
            models.Index(fields=["training", "order"]),
            GinIndex(
                name="exercise_units",
                fields=["units"],
                opclasses=["jsonb_path_ops"],
            ),
            GinIndex(
                name="exercise_sets",
                fields=["sets"],
                opclasses=["jsonb_path_ops"],
            ),
        ]
        ordering = ["order"]

    def clean(self):
        sets: list | None = self.sets
        units: dict | None = self.units
        if sets:
            for exercise in sets:
                for field, value in exercise.items():
                    if isinstance(ALLOWED_EXERCISE_FIELDS[field], list):
                        if not units or field not in units:
                            raise ValidationError(
                                f"Field {field} in 'Sets' must have unit"
                            )

    def __repr__(self):
        return f"<Exercise ({self.template.name}) for Training {self.training.id}>"

    def __str__(self):
        return f"{self.template.name} (Order {self.order})"
