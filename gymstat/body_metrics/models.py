from django.conf import settings
from django.db import models


class Metric(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="owned_exercises",
        on_delete=models.CASCADE,
    )
    name = models.CharField(max_length=50)
    description = models.TextField(blank=True, null=True)
    admin = models.BooleanField(default=False)

    class Meta:
        indexes = [models.Index(fields=["name", "admin"])]
        ordering = ["name"]

    def __str__(self):
        return self.name

    def __repr__(self):
        return f"Metric {self.pk} - {self.name} created by {self.owner} (is admin - {self.admin})"
