from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase

from ...models import Metric
from user.tests import user, other_user, login_data


User = get_user_model()


metric = {
    "owner": user,
    "name": "Weight",
    "unit": "kg",
    "description": "User Metric",
    "admin": False,
}

metric_other_user = {
    "owner": other_user,
    "name": "BMI",
    "unit": "",
    "description": "Other user's metric",
    "admin": False,
}

metric_admin = {
    "owner": other_user,
    "name": "Height",
    "unit": "cm",
    "description": "Admin Metric",
    "admin": True,
}

list_create_url = reverse("metrics:get-create-metrics")
get_url = reverse("metrics:get-edit-metric")


class MetricAPITests(APITestCase):
    def setUp(self):
        Metric.objects.create(**metric)
        Metric.objects.create(**metric_other_user)
        Metric.objects.create(**metric_admin)
        self.client.login(**login_data)
