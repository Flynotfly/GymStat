import datetime

from django.apps import apps
from django.contrib.auth import get_user_model
from django.core.exceptions import PermissionDenied, ValidationError
from django.db import models, transaction

from .validators import validate_exercise_data

User = get_user_model()

Exercise = apps.get_model("training", "Exercise")
TrainingTemplate = apps.get_model("training", "TrainingTemplate")
ExerciseTemplate = apps.get_model("training", "ExerciseTemplate")


class TrainingManager(models.Manager):

    @transaction.atomic
    def create_training(
        self,
        owner: User,
        conducted: datetime.datetime,
        template: TrainingTemplate = None,
        title: str = None,
        description: str = None,
        notes: list = None,
        exercises_data: list = None,
    ):
        training = self.model(
            owner=owner,
            conducted=conducted,
            template=template,
            title=title,
            description=description,
            notes=notes,
        )
        training.full_clean()
        training.save()
        if exercises_data:
            self._process_exercise_data(owner, training, exercises_data)
        return training

    @transaction.atomic
    def update_training(
        self,
        training,
        owner,
        conducted,
        template=None,
        title=None,
        notes=None,
        exercises_data=None,
    ):
        if training.owner != owner:
            raise PermissionDenied("You are not the owner of this training.")

        training.conducted = conducted
        training.template = template
        training.title = title
        training.notes = notes
        training.save()

        training.exercises.all().delete()
        if exercises_data:
            self._process_exercise_data(owner, training, exercises_data)
        return training

    @staticmethod
    def _process_exercise_data(owner, training, exercises_data):
        Exercise = apps.get_model("training", "Exercise")
        unauthorized_templates = []
        for idx, exercise_data in enumerate(exercises_data, start=1):
            # Expect the template to be an instance
            exercise_template = exercise_data.get("template")
            if not exercise_template:
                raise ValidationError(
                    f"Exercise #{idx} is missing a template."
                )

            # Check allowed condition: template must be active and either owned by the user or an admin template.
            if not (
                exercise_template.is_active
                and (
                    exercise_template.owner == owner
                    or exercise_template.is_admin
                )
            ):
                unauthorized_templates.append(exercise_template)

        if unauthorized_templates:
            raise PermissionDenied(
                f"Unauthorized templates: {unauthorized_templates}"
            )

        exercises_to_create = []
        for idx, exercise_data in enumerate(exercises_data, start=1):
            template = exercise_data.get("template")
            order = exercise_data.get("order")
            data = exercise_data.get("data")

            try:
                validate_exercise_data(data, template)
            except ValidationError as ve:
                raise ValidationError(
                    f"Validation error in exercise #{idx} with template '{template.name}': {ve}"
                )

            exercises_to_create.append(
                Exercise(
                    training=training,
                    template=template,
                    order=order,
                    data=data,
                )
            )
        Exercise.objects.bulk_create(exercises_to_create)
