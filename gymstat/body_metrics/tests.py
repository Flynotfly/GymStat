from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Metric

User = get_user_model()


class MetricAPITests(APITestCase):
    def setUp(self):
        # Create two users
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

        # Create metrics
        self.metric_user = Metric.objects.create(
            owner=self.user, name="Weight", unit="kg", description="User Metric", admin=False
        )
        self.metric_admin = Metric.objects.create(
            owner=self.other_user, name="Height", unit="cm", description="Admin Metric", admin=True
        )
        self.metric_other_user = Metric.objects.create(
            owner=self.other_user, name="BMI", unit="", description="Other user's metric", admin=False
        )

        # Authenticate the client with the main user
        self.client.login(email="test@example.com", password="testpass")

    def test_get_all_metrics(self):
        url = reverse("metrics:get-create-metrics")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)  # Should return own and admin metrics

    def test_get_user_metrics(self):
        url = reverse("metrics:get-create-metrics") + "?type=user"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Weight")

    def test_get_admin_metrics(self):
        url = reverse("metrics:get-create-metrics") + "?type=admin"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["name"], "Height")

    def test_create_metric(self):
        url = reverse("metrics:get-create-metrics")
        data = {"name": "Pulse", "unit": "bpm", "description": "Heart Rate"}
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Metric.objects.filter(owner=self.user).count(), 2)
        self.assertEqual(response.data["name"], "Pulse")

    def test_get_single_metric_owned(self):
        url = reverse("metrics:get-edit-metric", kwargs={"pk": self.metric_user.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Weight")

    def test_get_single_metric_admin(self):
        url = reverse("metrics:get-edit-metric", kwargs={"pk": self.metric_admin.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Height")

    def test_get_single_metric_not_accessible(self):
        url = reverse("metrics:get-edit-metric", kwargs={"pk": self.metric_other_user.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_edit_owned_metric(self):
        url = reverse("metrics:get-edit-metric", kwargs={"pk": self.metric_user.pk})
        data = {"name": "Body Weight", "unit": "kg", "description": "Updated Desc"}
        response = self.client.put(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.metric_user.refresh_from_db()
        self.assertEqual(self.metric_user.name, "Body Weight")

    def test_edit_admin_metric_not_allowed(self):
        url = reverse("metrics:get-edit-metric", kwargs={"pk": self.metric_admin.pk})
        data = {"name": "New Height", "unit": "cm", "description": "Updated Desc"}
        response = self.client.put(url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_owned_metric(self):
        url = reverse("metrics:get-edit-metric", kwargs={"pk": self.metric_user.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Metric.objects.filter(pk=self.metric_user.pk).exists())

    def test_delete_admin_metric_not_allowed(self):
        url = reverse("metrics:get-edit-metric", kwargs={"pk": self.metric_admin.pk})
        response = self.client.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(Metric.objects.filter(pk=self.metric_admin.pk).exists())

    def test_unauthenticated_access(self):
        self.client.logout()
        url = reverse("metrics:get-create-metrics")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
