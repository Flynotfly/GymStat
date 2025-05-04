from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Metric, Record

User = get_user_model()


class RecordAPITests(APITestCase):
    def setUp(self):
        # Users
        self.user = User.objects.create_user(
            email="test@example.com",
            first_name="Test",
            last_name="User",
            password="testpass",
        )

        self.other_user = User.objects.create_user(
            email="other@example.com",
            first_name="Other",
            last_name="User",
            password="otherpass",
        )

        # Metrics
        self.user_metric = Metric.objects.create(
            owner=self.user, name="Weight", unit="kg", admin=False
        )

        self.admin_metric = Metric.objects.create(
            owner=self.other_user, name="Height", unit="cm", admin=True
        )

        self.other_user_metric = Metric.objects.create(
            owner=self.other_user, name="BMI", unit="", admin=False
        )

        # Records
        self.user_record = Record.objects.create(
            owner=self.user,
            metric=self.user_metric,
            value=75.0,
            datetime="2025-03-20T09:00:00Z",
        )

        self.admin_metric_record = Record.objects.create(
            owner=self.user,
            metric=self.admin_metric,
            value=180,
            datetime="2025-03-21T10:00:00Z",
        )

        self.other_user_record = Record.objects.create(
            owner=self.other_user,
            metric=self.other_user_metric,
            value=22.5,
            datetime="2025-03-22T11:00:00Z",
        )

        self.client.login(email="test@example.com", password="testpass")

    def test_get_records_for_user_metric(self):
        url = (
            reverse("metrics:get-create-records")
            + f"?metric={self.user_metric.pk}"
        )
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["value"], 75.0)

    def test_get_records_for_admin_metric(self):
        url = (
            reverse("metrics:get-create-records")
            + f"?metric={self.admin_metric.pk}"
        )
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["value"], 180)

    def test_get_records_metric_not_accessible(self):
        url = (
            reverse("metrics:get-create-records")
            + f"?metric={self.other_user_metric.pk}"
        )
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_record_user_metric(self):
        url = reverse("metrics:get-create-records")
        data = {
            "metric": self.user_metric.pk,
            "value": 76.5,
            "datetime": "2025-03-23T08:00:00Z",
        }
        response = self.client.post(url, data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Record.objects.filter(owner=self.user).count(), 3)

    def test_create_record_admin_metric(self):
        url = reverse("metrics:get-create-records")
        data = {
            "metric": self.admin_metric.pk,
            "value": 181,
            "datetime": "2025-03-24T08:00:00Z",
        }
        response = self.client.post(url, data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(
            Record.objects.filter(
                owner=self.user, metric=self.admin_metric
            ).count(),
            2,
        )

    def test_create_record_not_accessible_metric(self):
        url = reverse("metrics:get-create-records")
        data = {
            "metric": self.other_user_metric.pk,
            "value": 23,
            "datetime": "2025-03-25T08:00:00Z",
        }
        response = self.client.post(url, data)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_get_single_owned_record(self):
        url = reverse(
            "metrics:get-edit-record", kwargs={"pk": self.user_record.pk}
        )
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["value"], 75.0)

    def test_get_single_not_owned_record(self):
        url = reverse(
            "metrics:get-edit-record", kwargs={"pk": self.other_user_record.pk}
        )
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_edit_owned_record(self):
        url = reverse(
            "metrics:get-edit-record", kwargs={"pk": self.user_record.pk}
        )
        data = {
            "metric": self.user_metric.pk,
            "value": 77,
            "datetime": "2025-03-26T09:00:00Z",
        }
        response = self.client.put(url, data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user_record.refresh_from_db()
        self.assertEqual(self.user_record.value, 77)

    def test_edit_not_owned_record(self):
        url = reverse(
            "metrics:get-edit-record", kwargs={"pk": self.other_user_record.pk}
        )
        data = {
            "metric": self.other_user_metric.pk,
            "value": 24,
            "datetime": "2025-03-27T09:00:00Z",
        }
        response = self.client.put(url, data)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_owned_record(self):
        url = reverse(
            "metrics:get-edit-record", kwargs={"pk": self.user_record.pk}
        )
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(
            Record.objects.filter(pk=self.user_record.pk).exists()
        )

    def test_delete_not_owned_record(self):
        url = reverse(
            "metrics:get-edit-record", kwargs={"pk": self.other_user_record.pk}
        )
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(
            Record.objects.filter(pk=self.other_user_record.pk).exists()
        )
