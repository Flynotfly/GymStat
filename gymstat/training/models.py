from django.contrib.auth.models import User
from django.db import models


class Training(models.Model):
    owner = models.ForeignKey(
        User,
        related_name='trainings',
        on_delete=models.CASCADE,
    )
    conducted = models.DateTimeField()
    description = models.TextField(blank=True)

    class Meta:
        indexes = [models.Index(fields=['-conducted'])]
        ordering = ['-conducted']


class Exercise(models.Model):
    training = models.ForeignKey(
        Training,
        related_name='exercises',
        on_delete=models.CASCADE
    )
    order = models.PositiveIntegerField()
    weight = models.DecimalField(max_digits=6, decimal_places=2)
    repetitions = models.PositiveIntegerField()

    class Meta:
        ordering = ['order']
