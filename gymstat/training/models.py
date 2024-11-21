from django.contrib.auth.models import User
from django.db import models
from django.urls import reverse


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

    def get_absolute_url(self):
        return reverse('training:edit', args=[self.id])


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
