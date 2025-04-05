from django.conf import settings
from django.contrib.postgres.indexes import GinIndex
from django.core.exceptions import ValidationError
from django.db import models

from .managers import TrainingManager

NOTES_FIELDS = ["Text", "Datetime", "Duration", "Number", "5stars", "10stars"]


ALLOWED_EXERCISE_FIELDS = {
    "Sets": "Int",
    "Reps": "Int",
    "Weight": ["Float", ["kg", "lbs"]],
    "Time": "Duration",
    "Distance": ["Float", ["m", "km", "mi"]],
    "Speed": ["Float", ["kph", "mph", "mps"]],
    "Rounds": "Int",
    "Rest": "Duration",
    "RPE": "Int",
    "Attempts": "Int",
    "Successes": "Int",
    "Notes": "Text",
    "Tempo": "Text",
}


def validate_training_template_data(data):
    if not isinstance(data, dict):
        raise ValidationError("Data must be a dictionary.")

    # Validate Notes
    notes = data.get("Notes")
    if notes is not None:
        if not isinstance(notes, list):
            raise ValidationError("Notes must be a list.")
        for note in notes:
            if not isinstance(note, dict):
                raise ValidationError("Each note must be a dictionary.")
            name = note.get("Name")
            field = note.get("field")
            required = note.get("Required")
            default = note.get("Default", "")

            if not isinstance(name, str):
                raise ValidationError("Note name must be a string.")
            if field not in NOTES_FIELDS:
                raise ValidationError(f"Invalid field '{field}' in note.")
            if required not in ["True", "False"]:
                raise ValidationError(
                    "Note 'Required' must be 'True' or 'False'."
                )
            if not isinstance(default, str):
                raise ValidationError("Note 'Default' must be a string.")

    # Validate Exercises
    exercises = data.get("Exercises")
    if exercises is not None:
        if not isinstance(exercises, list):
            raise ValidationError("Exercises must be a list.")
        for exercise in exercises:
            if not isinstance(exercise, dict):
                raise ValidationError("Each exercise must be a dictionary.")

            # Check required 'Template'
            template = exercise.get("Template")
            if template is None or not isinstance(template, int):
                raise ValidationError(
                    "'Template' must be an integer in each exercise."
                )

            unit_dict = exercise.get("Unit", {})
            sets = exercise.get("Sets", [])
            if sets:
                if not isinstance(sets, list):
                    raise ValidationError("'Sets' must be a list.")
                for s in sets:
                    if not isinstance(s, dict):
                        raise ValidationError("Each set must be a dictionary.")
                    if not s:
                        raise ValidationError(
                            "Set dictionaries must not be empty."
                        )
                    for field, value in s.items():
                        allowed = ALLOWED_EXERCISE_FIELDS.get(field)
                        if allowed is None:
                            raise ValidationError(
                                f"Field '{field}' is not allowed."
                            )

                        if value == "":
                            continue  # Empty string allowed

                        # Validate field types and units
                        expected_type = (
                            allowed if isinstance(allowed, str) else allowed[0]
                        )
                        allowed_units = (
                            allowed[1] if isinstance(allowed, list) else None
                        )

                        if expected_type == "Int":
                            try:
                                int(value)
                            except ValueError:
                                raise ValidationError(
                                    f"'{field}' must be an integer."
                                )
                        elif expected_type == "Float":
                            try:
                                float(value)
                            except ValueError:
                                raise ValidationError(
                                    f"'{field}' must be a float."
                                )
                        elif expected_type == "Duration":
                            if not isinstance(value, str):
                                raise ValidationError(
                                    f"'{field}' must be a duration string."
                                )
                        elif expected_type == "Text":
                            if not isinstance(value, str):
                                raise ValidationError(
                                    f"'{field}' must be a string."
                                )
                        else:
                            raise ValidationError(
                                f"Unknown type '{expected_type}' for '{field}'."
                            )

                        # Validate units if applicable
                        if allowed_units:
                            unit_value = unit_dict.get(field)
                            if unit_value not in allowed_units:
                                raise ValidationError(
                                    f"Field '{field}' must have unit from {allowed_units}."
                                )


class TrainingTemplate(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="training_templates",
        on_delete=models.CASCADE,
    )
    name = models.CharField(max_length=70)
    description = models.TextField(blank=True, null=True)
    data = models.JSONField(validators=[validate_training_template_data])
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


def validate_notes(value):
    if not isinstance(value, dict):
        raise ValidationError("Notes must be a dictionary.")
    for key, val in value.items():
        if not isinstance(key, str) or not isinstance(val, str):
            raise ValidationError(
                "Notes dictionary keys and values must be strings."
            )


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
    notes = models.JSONField(
        validators=[validate_notes], blank=True, null=True
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


def validate_fields(value):
    if not isinstance(value, list):
        raise ValidationError("Fields must be a list.")
    invalid_fields = [
        field for field in value if field not in ALLOWED_EXERCISE_FIELDS
    ]
    if invalid_fields:
        raise ValidationError(
            f"Invalid fields provided: {', '.join(invalid_fields)}. "
            f"Allowed fields are: {', '.join(ALLOWED_EXERCISE_FIELDS.keys())}."
        )


class ExerciseTemplate(models.Model):
    name = models.CharField(max_length=50)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="exercise_templates",
        on_delete=models.CASCADE,
    )
    fields = models.JSONField(validators=[validate_fields])
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
    data = models.JSONField()

    class Meta:
        indexes = [
            models.Index(fields=["order"]),
            models.Index(fields=["training", "order"]),
            GinIndex(
                name="exercise_data",
                fields=["data"],
                opclasses=["jsonb_path_ops"],
            ),
        ]
        ordering = ["order"]

    def __repr__(self):
        return f"<Exercise ({self.template.name}) for Training {self.training.id}>"

    def __str__(self):
        return f"{self.template.name} (Order {self.order})"


# class ExerciseFields(models.Model):
#     owner = models.ForeignKey(
#         settings.AUTH_USER_MODEL,
#         related_name="owned_exercises",
#         on_delete=models.CASCADE,
#     )
#     name = models.CharField(max_length=50)
#     input = models.CharField()  # TODO: add chooses
#     unit = models.CharField(max_length=15, blank=True, null=True)
#     is_admin = models.BooleanField(default=False)
#     is_active = models.BooleanField(default=True)
#     created_at = models.DateTimeField(auto_now_add=True)
#     edited_at = models.DateTimeField(auto_now=True)
#
#     class Meta:
#         indexes = [models.Index(fields=["is_active", "is_admin", "name"])]
#         ordering = ["name"]
#
#     def __str__(self):
#         return self.name
#
#     def __repr__(self):
#         return (f"<Exercise field {self.name}, input - {self.input}, unit - {self.unit}, "
#                 f"{'admin' if self.is_admin else 'created by user'}, "
#                 f"{'active' if self.is_active else 'deactivated'}>")


# class ExerciseType(models.Model):
#     owner = models.ForeignKey(
#         settings.AUTH_USER_MODEL,
#         related_name="owned_exercises",
#         on_delete=models.CASCADE,
#     )
#     name = models.CharField(max_length=50)
#     description = models.TextField(blank=True, null=True)
#     iconId = models.IntegerField(default=1)
#     iconColor = models.CharField(max_length=8, default="blue")
#     base = models.BooleanField(default=False)
#
#     def __str__(self):
#         return self.name
#
#     def __repr__(self):
#         return f"Exercise {self.pk} - {self.name}"
#
#     def get_absolute_url(self):
#         return reverse("training:exercise_detail", args=[self.id])
#
#     class Meta:
#         indexes = [models.Index(fields=["name", "base"])]
#         ordering = ["name"]
