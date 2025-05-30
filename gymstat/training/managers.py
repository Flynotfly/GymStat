from __future__ import annotations

import datetime
from typing import TYPE_CHECKING

from django.apps import apps
from django.contrib.auth import get_user_model
from django.core.exceptions import PermissionDenied, ValidationError
from django.db import models, transaction

if TYPE_CHECKING:
    from training.models import (
        Training,
        TrainingTemplate,
    )


User = get_user_model()


class TrainingManager(models.Manager):

    @transaction.atomic
    def create_training(
        self,
        owner: User,
        conducted: datetime.datetime,
        template: TrainingTemplate | None = None,
        title: str | None = None,
        description: str | None = None,
        notes: list | None = None,
        exercises_data: list | None = None,
    ):
        if not template.owner == owner:
            raise PermissionDenied("You are not the owner of this training template.")
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
        training: Training,
        owner: User,
        conducted: datetime.datetime,
        template: TrainingTemplate | None = None,
        title: str | None = None,
        description: str | None = None,
        notes: list | None = None,
        exercises_data: list | None = None,
    ):
        if training.owner != owner:
            raise PermissionDenied("You are not the owner of this training.")
        if not template.owner == owner:
            raise PermissionDenied("You are not the owner of this training template.")

        training.conducted = conducted
        training.template = template
        training.title = title
        training.description = description
        training.notes = notes
        training.full_clean()
        training.save()

        training.exercises.all().delete()
        if exercises_data:
            self._process_exercise_data(owner, training, exercises_data)
        return training

    @staticmethod
    def _process_exercise_data(
        owner: User,
        training: Training,
        exercises_data: list,
    ):
        Exercise = apps.get_model("training", "Exercise")

        if not isinstance(exercises_data, list):
            raise ValidationError("Exercises data must be a list")
        unauthorized_templates = []
        for idx, single_exercise_data in enumerate(exercises_data, start=1):
            # Expect the template to be an instance
            exercise_template = single_exercise_data.get("Template")
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
        orders = []
        for idx, single_exercise_data in enumerate(exercises_data, start=1):
            template = single_exercise_data.get("Template")
            order = single_exercise_data.get("Order")
            units = single_exercise_data.get("Units")
            sets = single_exercise_data.get("Sets")
            exercise = Exercise(
                training=training,
                template=template,
                order=order,
                units=units,
                sets=sets,
            )
            exercise.full_clean()
            orders.append(order)
            exercises_to_create.append(exercise)

        # Check order
        if not set(orders) == set(range(1, len(orders) + 1)):
            raise ValidationError(
                "The order of exercises is incorrect. It should start from 1 and increase by 1."
            )

        Exercise.objects.bulk_create(exercises_to_create)
