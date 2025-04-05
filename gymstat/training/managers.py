from django.db import models, transaction
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import Q

from .models import Training, Exercise, TrainingTemplate, ExerciseTemplate


User = get_user_model()


class ExerciseTemplateManager(models.Manager):
    def allowed_for_user(self, user):
        return self.get_queryset().filter(
            Q(is_active=True),
            Q(owner=user) | Q(is_admin=True)
        )


# class TrainingManager(models.Manager):
#
#     @transaction.atomic
#     def create_training(
#             self,
#             owner_id,
#             conducted,
#             template_id=None,
#             title=None,
#             notes=None,
#             exercises_data=None,
#     ):
#
#         owner = get_object_or_404(User, pk=owner_id)
#         template = None
#         if template_id:
#             template = get_object_or_404(TrainingTemplate, pk=template_id)
#
#         if exercises_data:
#             exercise_template_ids = {
#                 e["template_id"] for e in exercises_data if "template_id" in e
#             }
#             exercise_templates = ExerciseTemplate.objects.in_bulk(exercise_template_ids)
#
#         training = self.create(
#             owner=owner,
#             conducted=conducted,
#             template=template,
#             title=title,
#             notes=notes
#         )
#
#         if exercises_data:
#
