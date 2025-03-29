from django.conf import settings
from django.contrib.postgres.indexes import GinIndex
from django.db import models
from django.urls import reverse


class Training(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="trainings",
        on_delete=models.CASCADE,
    )
    conducted = models.DateTimeField()
    title = models.CharField(max_length=70, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    score = models.PositiveIntegerField(default=10)

    class Meta:
        indexes = [models.Index(fields=["-conducted"])]
        ordering = ["-conducted"]

    def get_absolute_url(self):
        return reverse("training:details", args=[self.id])


class ExerciseTemplate(models.Model):
    name = models.CharField(max_length=50)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="exercise_templates",
        on_delete=models.CASCADE,
    )
    fields = models.JSONField()
    description = models.TextField(blank=True, null=True)
    is_admin = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    icon = models.ImageField(upload_to='exercise_icons/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    edited_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["is_active", "name"]),
            models.Index(fields=["is_active", "is_admin", "name"]),
            GinIndex(name="exercise_templates_fields", fields=["fields"], opclasses=['jsonb_path_ops']),
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
            models.Index(fields=["training", "order"]),
            GinIndex(name="exercise_data", fields=["data"], opclasses=['jsonb_path_ops']),
        ]
        ordering = ["order"]

    def __repr__(self):
        return f"<Exercise ({self.template.name}) for Training {self.training.id}>"

    def __str__(self):
        return f"{self.template.name} (Order {self.order})"


class TrainingTemplate(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='training_templates',
        on_delete=models.CASCADE
    )
    name = models.CharField(max_length=70)
    description = models.TextField(blank=True, null=True)
    data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
    edited_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=["name"]),
            GinIndex(name="training_template_data", fields=["data"], opclasses=['jsonb_path_ops'])
        ]
        ordering = ["name"]

    def __str__(self):
        return self.name

    def __repr__(self):
        return f"Training template {self.pk} {self.name} of user {self.owner}"


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
