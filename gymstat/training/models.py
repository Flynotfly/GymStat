from django.contrib.auth.models import User
from django.db import models


class Training(models.Model):
    owner = models.ForeignKey(
        User,
        related_name='trainings',
        on_delete=models.CASCADE,
    )
    time = models.DateTimeField(auto_now_add=True)
    description = models.TextField(blank=True)
