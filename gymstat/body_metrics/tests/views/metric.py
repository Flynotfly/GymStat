from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase

from ...models import Metric
from user.tests import user_data, other_user_data, login_data


User = get_user_model()


def get_list_create_url(metric_type: str = None):
    if metric_type is not None:
        return reverse("metrics:get-create-metrics") + "?type=" + metric_type
    return reverse("metrics:get-create-metrics")


def get_details_url(pk: int):
    return reverse("metrics:get-edit-metric", kwargs={"pk": pk})


class MetricAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(**user_data)
        self.other_user = User.objects.create_user(**other_user_data)
        self.metric = Metric.objects.create(
            owner=self.user,
            name="First metric",
            unit="kg",
            description="User Metric",
            admin=False,
        )
        self.metric_second = Metric.objects.create(
            owner=self.user,
            name="Second metric",
            unit="kg",
            description="Second User Metric",
            admin=False,
        )
        self.metric_other_user = Metric.objects.create(
            owner=self.other_user,
            name="Non owned metric",
            unit="kg",
            description="Other user's metric",
            admin=False,
        )
        self.metric_admin = Metric.objects.create(
            owner=self.other_user,
            name="Admin metric",
            unit="cm",
            description="Admin Metric",
            admin=True,
        )
        self.metric_admin_second = Metric.objects.create(
            owner=self.other_user,
            name="Second admin metric",
            unit="cm",
            description="Second Admin Metric",
            admin=True,
        )
        self.new_metric_data = {
            "name": "New metric",
            "unit": "bpm",
            "description": "New metric",
        }
        self.client.login(**login_data)

    def test_get_all_metrics(self):
        responce = self.client.get(get_list_create_url())
        self.assertEqual(responce.status_code, 200)
        self.assertEqual(responce.data["count"], 4)
        returned_ids = {metric["id"] for metric in responce.data["results"]}
        excpeted_ids = {self.metric.id, self.metric_second.id, self.metric_admin.id, self.metric_admin_second.id}
        self.assertEqual(returned_ids, excpeted_ids)

    def test_get_user_metrics(self):
        responce = self.client.get(get_list_create_url("user"))
        self.assertEqual(responce.status_code, 200)
        self.assertEqual(responce.data["count"], 2)
        returned_ids = {metric["id"] for metric in responce.data["results"]}
        excpeted_ids = {self.metric.id, self.metric_second.id}
        self.assertEqual(returned_ids, excpeted_ids)

    def test_get_admin_metrics(self):
        responce = self.client.get(get_list_create_url("admin"))
        self.assertEqual(responce.status_code, 200)
        self.assertEqual(responce.data["count"], 2)
        returned_ids = {metric["id"] for metric in responce.data["results"]}
        excpeted_ids = {self.metric_admin.id, self.metric_admin_second.id}
        self.assertEqual(returned_ids, excpeted_ids)

    def test_get_owned_metric(self):
        responce = self.client.get(get_details_url(self.metric.id))
        self.assertEqual(responce.status_code, 200)
        self.assertEqual(responce.data["id"], self.metric.id)
        self.assertEqual(responce.data["name"], self.metric.name)

    def test_get_admin_metric(self):
        responce = self.client.get(get_details_url(self.metric_admin.id))
        self.assertEqual(responce.status_code, 200)
        self.assertEqual(responce.data["id"], self.metric_admin.id)
        self.assertEqual(responce.data["name"], self.metric_admin.name)

    def test_get_other_user_metric(self):
        responce = self.client.get(get_details_url(self.metric_other_user.id))
        self.assertEqual(responce.status_code, 403)

    def test_create_metric(self):
        responce = self.client.post(get_list_create_url(), self.new_metric_data)
        self.assertEqual(responce.status_code, 201)
        self.assertEqual(responce.data["name"], self.new_metric_data["name"])
        self.assertEqual(Metric.objects.filter(owner=self.user).count(), 3)

    def test_edit_owned_metric(self):
        responce = self.client.put(get_details_url(self.metric.pk), self.new_metric_data)
        self.assertEqual(responce.status_code, 200)
        self.metric.refresh_from_db()
        self.assertEqual(self.metric.name, self.new_metric_data["name"])

    def test_edit_admin_metric(self):
        responce = self.client.put(get_details_url(self.metric_admin.pk), self.new_metric_data)
        self.assertEqual(responce.status_code, 403)

    def test_edit_other_user_metric(self):
        responce = self.client.put(get_details_url(self.metric_other_user.pk), self.new_metric_data)
        self.assertEqual(responce.status_code, 403)

    def test_delete_owned_metric(self):
        responce = self.client.delete(get_details_url(self.metric.pk))
        self.assertEqual(responce.status_code, 204)
        self.assertFalse(Metric.objects.filter(pk=self.metric.id).exists())

    def test_delete_admin_metric(self):
        responce = self.client.delete(get_details_url(self.metric_admin.pk))
        self.assertEqual(responce.status_code, 403)
        self.assertTrue(Metric.objects.filter(pk=self.metric_admin.id).exists())

    def test_delete_other_user_metric(self):
        responce = self.client.delete(get_details_url(self.metric_other_user.pk))
        self.assertEqual(responce.status_code, 403)
        self.assertTrue(Metric.objects.filter(pk=self.metric_other_user.id).exists())

    def test_unauthenticated_access(self):
        self.client.logout()
        responce = self.client.get(get_list_create_url())
        self.assertEqual(responce.status_code, 403)
