from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase

from user.tests import login_data, other_user_data, user_data

from ...models import TrainingTemplate
from ..models.training_template import VALID_DATA

User = get_user_model()


def get_list_url():
    return reverse("training:training-template-list-create")


def get_create_url():
    return reverse("training:training-template-list-create")


def get_detail_url(pk: int):
    return reverse("training:training-template-detail", kwargs={"pk": pk})


class TrainingTemplateAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(**user_data)
        self.other_user = User.objects.create_user(**other_user_data)
        self.template = TrainingTemplate.objects.create(
            name="Usuall training",
            owner=self.user,
            data=VALID_DATA,
            description="This is description",
        )
        self.second_template = TrainingTemplate.objects.create(
            name="Second training",
            owner=self.user,
            data=VALID_DATA,
        )
        self.other_user_template = TrainingTemplate.objects.create(
            name="Other user's template",
            owner=self.other_user,
            data=VALID_DATA,
        )
        self.new_template_data = {
            "name": "New template",
            "data": VALID_DATA,
            "description": "ddd",
        }
        self.client.login(**login_data)

    def test_get_all_templates(self):
        response = self.client.get(get_list_url())
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 2)
        returned_ids = {
            exercise["id"] for exercise in response.data["results"]
        }
        expected_ids = {
            self.template.pk,
            self.second_template.pk,
        }
        self.assertEqual(returned_ids, expected_ids)

    def test_get_single_template(self):
        response = self.client.get(get_detail_url(self.template.pk))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], self.template.pk)
        self.assertEqual(response.data["name"], self.template.name)

    def test_get_other_userTemplate(self):
        response = self.client.get(get_detail_url(self.other_user_template.pk))
        self.assertEqual(response.status_code, 403)

    def test_create_template(self):
        response = self.client.post(get_create_url(), self.new_template_data)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(TrainingTemplate.objects.count(), 4)
        template = TrainingTemplate.objects.filter(
            name=self.new_template_data["name"]
        )
        self.assertEqual(template.count(), 1)

    def test_edit_template(self):
        response = self.client.put(
            get_detail_url(self.template.pk), self.new_template_data
        )
        self.assertEqual(response.status_code, 200)
        self.template.refresh_from_db()
        self.assertEqual(self.template.name, self.new_template_data["name"])

    def test_edit_other_user_template(self):
        response = self.client.put(
            get_detail_url(self.other_user_template.pk), self.new_template_data
        )
        self.assertEqual(response.status_code, 403)

    def test_delete_template(self):
        response = self.client.delete(get_detail_url(self.template.pk))
        self.assertEqual(response.status_code, 204)
        self.assertFalse(TrainingTemplate.objects.filter(pk=self.template.pk))

    def test_delete_other_user_template(self):
        response = self.client.delete(
            get_detail_url(self.other_user_template.pk)
        )
        self.assertEqual(response.status_code, 403)
