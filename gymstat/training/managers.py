from django.apps import apps
from django.contrib.auth import get_user_model
from django.core.exceptions import PermissionDenied, ValidationError
from django.db import models, transaction

from .validators import validate_exercise_data

User = get_user_model()


class TrainingManager(models.Manager):

    @transaction.atomic
    def create_training(
        self,
        owner,
        conducted,
        template=None,
        title=None,
        notes=None,
        exercises_data=None,
    ):
        Exercise = apps.get_model("training", "Exercise")

        training = self.create(
            owner=owner,
            conducted=conducted,
            template=template,
            title=title,
            notes=notes,
        )

        if exercises_data:
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
                        f"Validation error in exercise #{idx} with template '{exercise_template.name}': {ve}"
                    )

                exercises_to_create.append(
                    Exercise(
                        training=training,
                        template=exercise_template,
                        order=order,
                        data=data,
                    )
                )
            Exercise.objects.bulk_create(exercises_to_create)

        return training

    @transaction.atomic
    def update_training(
            self,
            training,
            owner,
            conducted=None,
            template=None,
            title=None,
            notes=None,
            exercises_data=None,
    ):
        # Ensure that only the owner can update the training.
        if training.owner != owner:
            raise PermissionDenied("You are not the owner of this training.")

        # Update training fields if new values are provided.
        if conducted is not None:
            training.conducted = conducted
        if template is not None:
            training.template = template
        if title is not None:
            training.title = title
        if notes is not None:
            training.notes = notes
        training.save()

        training.exercises.all().delete()

        if exercises_data:
            Exercise = apps.get_model("training", "Exercise")
            unauthorized_templates = []
            # Validate each exercise's template and data.
            for idx, exercise_data in enumerate(exercises_data, start=1):
                exercise_template = exercise_data.get("template")
                if not exercise_template:
                    raise ValidationError(
                        f"Exercise #{idx} is missing a template."
                    )
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

            # Remove all existing exercises associated with this training.
            training.exercises.all().delete()

            exercises_to_create = []
            for idx, exercise_data in enumerate(exercises_data, start=1):
                exercise_template = exercise_data.get("template")
                order = exercise_data.get("order")
                data = exercise_data.get("data")
                try:
                    validate_exercise_data(data, exercise_template)
                except ValidationError as ve:
                    raise ValidationError(
                        f"Validation error in exercise #{idx} with template '{exercise_template.name}': {ve}"
                    )
                exercises_to_create.append(
                    Exercise(
                        training=training,
                        template=exercise_template,
                        order=order,
                        data=data,
                    )
                )
            Exercise.objects.bulk_create(exercises_to_create)

        return training
