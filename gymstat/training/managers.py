from django.apps import apps
from django.contrib.auth import get_user_model
from django.core.exceptions import PermissionDenied
from django.db import models, transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404

User = get_user_model()


class TrainingManager(models.Manager):

    @transaction.atomic
    def create_training(
        self,
        owner_id,
        conducted,
        template_id=None,
        title=None,
        notes=None,
        exercises_data=None,
    ):
        TrainingTemplate = apps.get_model("training", "TrainingTemplate")
        ExerciseTemplate = apps.get_model("training", "ExerciseTemplate")
        Exercise = apps.get_model("training", "Exercise")

        owner = get_object_or_404(User, pk=owner_id)
        template = None
        if template_id:
            template = get_object_or_404(TrainingTemplate, pk=template_id)

        training = self.create(
            owner=owner,
            conducted=conducted,
            template=template,
            title=title,
            notes=notes,
        )

        if exercises_data:
            exercise_template_ids = {
                e["template_id"] for e in exercises_data if "template_id" in e
            }
            allowed_templates = ExerciseTemplate.objects.filter(
                Q(is_active=True),
                Q(owner=owner) | Q(is_admin=True),
                pk__in=exercise_template_ids,
            ).in_bulk()

            unauthorized_templates = (
                exercise_template_ids - allowed_templates.keys()
            )
            if unauthorized_templates:
                raise PermissionDenied(
                    f"Unauthorized ExerciseTemplate IDs: {unauthorized_templates}"
                )

            exercises_to_create = []
            for exercise_data in exercises_data:
                template_id = exercise_data.get("template_id")
                exercise_template = allowed_templates.get(template_id)
                order = exercise_data.get("order")
                data = exercise_data.get("data")

                exercises_to_create.append(
                    Exercise(
                        training=training,
                        template=exercise_template,
                        order=order,
                        data=data,
                    )
                )
            Exercise.objects.bulk_create(exercises_to_create)
