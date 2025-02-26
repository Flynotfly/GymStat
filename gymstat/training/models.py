from django.conf import settings
from django.db import models
from django.urls import reverse


class Training(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="trainings",
        on_delete=models.CASCADE,
    )
    conducted = models.DateTimeField()
    duration = models.DurationField(blank=True, null=True)
    title = models.CharField(max_length=70, blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    class Meta:
        indexes = [models.Index(fields=["-conducted"])]
        ordering = ["-conducted"]

    def get_absolute_url(self):
        return reverse("training:details", args=[self.id])


class Exercise(models.Model):
    training = models.ForeignKey(
        Training, related_name="exercises", on_delete=models.CASCADE
    )
    exercise_type = models.ForeignKey(
        "ExerciseType",
        related_name="exercises",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
    )
    order = models.PositiveIntegerField()
    suborder = models.PositiveIntegerField()
    weight = models.DecimalField(max_digits=6, decimal_places=2)
    repetitions = models.PositiveIntegerField()

    class Meta:
        indexes = [models.Index(fields=["order", "suborder"])]
        ordering = ["order", "suborder"]


class ExerciseType(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="owned_exercises",
        on_delete=models.CASCADE,
    )
    bookmarked = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name="bookmarked_exercises",
        blank=True,
    )
    name = models.CharField(max_length=50)
    private = models.BooleanField(default=True)
    base = models.BooleanField(default=False)

    def __str__(self):
        return self.name

    def __repr__(self):
        return f"Exercise {self.pk} - {self.name}"

    def get_absolute_url(self):
        return reverse("training:exercise_detail", args=[self.id])

    class Meta:
        ordering = ["name"]
