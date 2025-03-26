from django.conf import settings
from django.db import models


class Metric(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="owned_metrics",
        on_delete=models.CASCADE,
    )
    name = models.CharField(max_length=50)
    unit = models.CharField(max_length=10)
    description = models.TextField(blank=True, null=True)
    admin = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    edited_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [models.Index(fields=["name", "admin"])]
        ordering = ["name"]

    def __str__(self):
        return self.name

    def __repr__(self):
        return f"Metric {self.pk} - {self.name} created by {self.owner} (is admin - {self.admin})"


class Record(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="owned_records",
        on_delete=models.CASCADE,
    )
    metric = models.ForeignKey(
        Metric,
        related_name="records",
        on_delete=models.CASCADE,
    )
    value = models.FloatField()
    datetime = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [models.Index(fields=["datetime"])]
        ordering = ["datetime"]

    def __str__(self):
        return f"{self.value} {self.metric.unit}"

    def __repr__(self):
        return f"Record of user {self.owner} for {self.datetime} created at {self.created_at}, {self.value}, metric {self.metric}"
