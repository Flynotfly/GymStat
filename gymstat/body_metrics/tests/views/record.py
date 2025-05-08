from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase

from user.tests import login_data, other_user_data, user_data

from ...models import Metric, Record

User = get_user_model()


def get_list_url(metric: Metric):
    return reverse("metrics:get-create-records") + f"?metric={metric.pk}"


def get_create_url():
    return reverse("metrics:get-create-records")


def get_details_url(record: Record):
    return reverse("metrics:get-edit-record", kwargs={"pk": record.pk})


class RecordAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(**user_data)
        self.other_user = User.objects.create_user(**other_user_data)

        self.metric = Metric.objects.create(
            owner=self.user, name="Weight", unit="kg", admin=False
        )
        self.admin_metric = Metric.objects.create(
            owner=self.other_user, name="Height", unit="cm", admin=True
        )
        self.other_user_metric = Metric.objects.create(
            owner=self.other_user, name="BMI", unit="", admin=False
        )

        self.user_record = Record.objects.create(
            owner=self.user,
            metric=self.metric,
            value=50,
            datetime="2025-03-20T09:00:00Z",
        )
        self.user_fresh_record = Record.objects.create(
            owner=self.user,
            metric=self.metric,
            value=100.0,
            datetime="2025-03-21T09:00:00Z",
        )

        self.admin_metric_record = Record.objects.create(
            owner=self.user,
            metric=self.admin_metric,
            value=200,
            datetime="2025-03-23T10:00:00Z",
        )
        self.admin_metric_fresh_record = Record.objects.create(
            owner=self.user,
            metric=self.admin_metric,
            value=400,
            datetime="2025-03-25T10:00:00Z",
        )
        self.other_user_record = Record.objects.create(
            owner=self.other_user,
            metric=self.other_user_metric,
            value=22.5,
            datetime="2025-03-22T11:00:00Z",
        )
        self.admin_metric_other_user_record = Record.objects.create(
            owner=self.other_user,
            metric=self.admin_metric,
            value=40,
            datetime="2025-03-19T11:00:00Z",
        )
        self.new_record_data = {
            "value": 10,
            "datetime": "2025-04-10T11:00:00Z",
        }

        self.client.login(**login_data)

    def test_get_records_user_metric(self):
        response = self.client.get(get_list_url(self.metric))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 2)
        self.assertEqual(
            response.data["results"][0]["id"], self.user_fresh_record.pk
        )
        self.assertEqual(
            response.data["results"][0]["value"], self.user_fresh_record.value
        )
        self.assertEqual(
            response.data["results"][1]["id"], self.user_record.pk
        )
        self.assertEqual(
            response.data["results"][1]["value"], self.user_record.value
        )

    def test_get_records_admin_metric(self):
        response = self.client.get(get_list_url(self.admin_metric))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 2)
        self.assertEqual(
            response.data["results"][0]["id"],
            self.admin_metric_fresh_record.pk,
        )
        self.assertEqual(
            response.data["results"][0]["value"],
            self.admin_metric_fresh_record.value,
        )
        self.assertEqual(
            response.data["results"][1]["id"], self.admin_metric_record.pk
        )
        self.assertEqual(
            response.data["results"][1]["value"],
            self.admin_metric_record.value,
        )

    def test_get_records_other_user_metric(self):
        response = self.client.get(get_list_url(self.other_user_metric))
        self.assertEqual(response.status_code, 403)

    def test_get_single_record_user_metric(self):
        response = self.client.get(get_details_url(self.user_record))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], self.user_record.pk)
        self.assertEqual(response.data["value"], self.user_record.value)

    def test_get_single_record_admin_metric(self):
        response = self.client.get(get_details_url(self.admin_metric_record))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], self.admin_metric_record.pk)
        self.assertEqual(
            response.data["value"], self.admin_metric_record.value
        )

    def test_get_single_record_other_user_metric(self):
        response = self.client.get(get_details_url(self.other_user_record))
        self.assertEqual(response.status_code, 403)

    def test_get_single_record_admin_metric_non_owned(self):
        response = self.client.get(
            get_details_url(self.admin_metric_other_user_record)
        )
        self.assertEqual(response.status_code, 403)

    def test_create_record_user_metric(self):
        self.new_record_data["metric"] = self.metric.pk
        response = self.client.post(get_create_url(), self.new_record_data)
        self.assertEqual(response.status_code, 201)
        records = Record.objects.filter(metric=self.metric, owner=self.user)
        self.assertEqual(records.count(), 3)
        self.assertEqual(records[0].value, self.new_record_data["value"])

    def test_create_record_admin_metric(self):
        self.new_record_data["metric"] = self.admin_metric.pk
        response = self.client.post(get_create_url(), self.new_record_data)
        self.assertEqual(response.status_code, 201)
        records = Record.objects.filter(
            metric=self.admin_metric, owner=self.user
        )
        self.assertEqual(records.count(), 3)
        self.assertEqual(records[0].value, self.new_record_data["value"])

    def test_create_record_other_user_metric(self):
        self.new_record_data["metric"] = self.other_user_metric.pk
        response = self.client.post(get_create_url(), self.new_record_data)
        self.assertEqual(response.status_code, 403)

    def test_edit_record_user_metric(self):
        self.new_record_data["metric"] = self.user_record.metric.pk
        response = self.client.put(
            get_details_url(self.user_record), self.new_record_data
        )
        self.assertEqual(response.status_code, 200)
        self.user_record.refresh_from_db()
        self.assertEqual(self.user_record.value, self.new_record_data["value"])

    def test_edit_record_admin_metric(self):
        self.new_record_data["metric"] = self.admin_metric_record.metric.pk
        response = self.client.put(
            get_details_url(self.admin_metric_record), self.new_record_data
        )
        self.assertEqual(response.status_code, 200)
        self.admin_metric_record.refresh_from_db()
        self.assertEqual(
            self.admin_metric_record.value, self.new_record_data["value"]
        )

    def test_edit_record_other_user_metric(self):
        self.new_record_data["metric"] = self.other_user_record.metric.pk
        response = self.client.put(
            get_details_url(self.other_user_record), self.new_record_data
        )
        self.assertEqual(response.status_code, 403)

    def test_edit_record_admin_metric_non_owned(self):
        self.new_record_data["metric"] = (
            self.admin_metric_other_user_record.metric.pk
        )
        response = self.client.put(
            get_details_url(self.admin_metric_other_user_record),
            self.new_record_data,
        )
        self.assertEqual(response.status_code, 403)

    def test_delete_record_user_metric(self):
        response = self.client.delete(get_details_url(self.user_record))
        self.assertEqual(response.status_code, 204)
        self.assertFalse(
            Record.objects.filter(pk=self.user_record.pk).exists()
        )

    def test_delete_record_admin_metric(self):
        response = self.client.delete(
            get_details_url(self.admin_metric_record)
        )
        self.assertEqual(response.status_code, 204)
        self.assertFalse(
            Record.objects.filter(pk=self.admin_metric_record.pk).exists()
        )

    def test_delete_record_other_user_metric(self):
        response = self.client.delete(get_details_url(self.other_user_record))
        self.assertEqual(response.status_code, 403)

    def test_delete_record_admin_metric_non_owned(self):
        response = self.client.delete(
            get_details_url(self.admin_metric_other_user_record)
        )
        self.assertEqual(response.status_code, 403)
