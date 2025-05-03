from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase

from ...models import Metric
from user.tests import user_data, other_user_data, login_data


User = get_user_model()


def get_list_url():
    return reverse("metrics:get-create-metrics")


def get_details_url(pk: int):
    return reverse("metrics:get-edit-metric", kwargs={"pk": pk})


class MetricAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(**user_data)
        self.other_user = User.objects.create_user(**other_user_data)
        self.metric = Metric.objects.create(
            owner=self.user,
            name="Weight",
            unit="kg",
            description="User Metric",
            admin=False,
        )
        self.metric_other_user = Metric.objects.create(
            owner=self.other_user,
            name="BMI",
            unit="",
            description="Other user's metric",
            admin=False,
        )
        self.metric_admin = Metric.objects.create(
            owner=self.other_user,
            name="Height",
            unit="cm",
            description="Admin Metric",
            admin=True,
        )
        self.client.login(**login_data)

    def test_get_all_metrics(self):
        responce = self.client.get(get_list_url())
        self.assertEqual(responce.status_code, 200)
        self.assertEqual(responce.data["count"], 2)
        returned_ids = {metric["id"] for metric in responce.data["results"]}
        excpeted_ids = {self.metric.id, self.metric_admin.id}
        self.assertEqual(returned_ids, excpeted_ids)
