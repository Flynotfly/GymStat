from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase

from user.tests import admin_user_data, login_data, other_user_data, user_data

from ...models import Exercise, ExerciseTemplate, Training, TrainingTemplate
from ..models.test_training import VALID_CONDUCTED, VALID_NOTES
from ..models.test_training_template import VALID_DATA

User = get_user_model()


def get_list_url():
    return reverse("training:training-list-create")


def get_create_url():
    return reverse("training:training-list-create")


def get_detail_url(pk: int):
    return reverse("training:training-detail", kwargs={"pk": pk})


class TrainingAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(**user_data)
        self.other_user = User.objects.create_user(**other_user_data)
        self.admin_user = User.objects.create_user(**admin_user_data)

        self.training_template = TrainingTemplate.objects.create(
            name="Usuall training",
            owner=self.user,
            data=VALID_DATA,
            description="This is description",
        )
        self.training_template_other_user = TrainingTemplate.objects.create(
            name="Other user training",
            owner=self.other_user,
            data=VALID_DATA,
            description="This is description",
        )

        self.exercise_template_first = ExerciseTemplate.objects.create(
            name="Bench press",
            owner=self.user,
            fields=["sets", "reps", "weight", "time"],
            tags=["chest", "triceps", "free weight"],
            description="First exercise",
        )
        self.exercise_template_admin = ExerciseTemplate.objects.create(
            name="Best exercise",
            owner=self.admin_user,
            fields=["sets", "reps", "weight", "time"],
            tags=["chest", "free weight"],
            description="Admin Exercise",
            is_admin=True,
        )
        self.exercise_template_other_user = ExerciseTemplate.objects.create(
            name="Leg press",
            owner=self.other_user,
            fields=["sets", "reps"],
            tags=["free weight"],
            description="Other user exercise",
        )

        self.exercise_data_first = {
            "Template": self.exercise_template_first,
            "Order": 1,
            "Units": {"weight": "kg"},
            "Sets": [
                {
                    "reps": "7",
                    "weight": "45",
                    "time": "01:10",
                    "sets": "3",
                },
                {
                    "reps": "4",
                    "weight": "60",
                },
                {
                    "reps": "8",
                    "weight": "70",
                },
            ],
        }
        self.exercise_data_first_another = {
            "Template": self.exercise_template_first,
            "Order": 1,
            "Units": {"weight": "lbs"},
            "Sets": [
                {
                    "reps": "7",
                    "weight": "45",
                    "time": "01:10",
                    "sets": "3",
                },
                {
                    "reps": "4",
                    "weight": "60",
                    "time": "01:11:10",
                },
            ],
        }
        self.exercise_data_second_admin = {
            "Template": self.exercise_template_admin,
            "Order": 2,
            "Units": {"weight": "kg"},
            "Sets": [
                {
                    "reps": "7",
                    "weight": "45",
                    "time": "01:10",
                    "sets": "3",
                },
                {
                    "reps": "4",
                    "weight": "60",
                    "time": "01:11:10",
                },
            ],
        }
        self.exercise_data_other_user = {
            "Template": self.exercise_template_other_user,
            "Order": 1,
            "Sets": [
                {
                    "reps": "7",
                    "sets": "3",
                },
                {
                    "reps": "4",
                    "time": "01:11:10",
                },
            ],
        }

        self.training = Training.objects.create_training(
            owner=self.user,
            conducted=VALID_CONDUCTED,
            template=self.training_template,
            title="First training",
            description="Valid description",
            notes=VALID_NOTES,
            exercises_data=[
                self.exercise_data_first,
                self.exercise_data_second_admin,
            ],
        )
        self.training_second = Training.objects.create_training(
            owner=self.user,
            conducted=VALID_CONDUCTED,
            template=self.training_template,
            title="Second training",
            notes=VALID_NOTES,
            exercises_data=[
                self.exercise_data_first_another,
            ],
        )
        self.training_other_user = Training.objects.create_training(
            owner=self.other_user,
            conducted=VALID_CONDUCTED,
            template=self.training_template,
            title="Another user training",
            notes=VALID_NOTES,
            exercises_data=[
                self.exercise_data_other_user,
            ],
        )

        self.new_training_data = {
            "conducted": VALID_CONDUCTED,
            "title": "New training",
            "notes": VALID_NOTES,
            "exercises_data": [
                self.exercise_data_first_another,
                self.exercise_data_second_admin,
            ],
        }

        self.client.login(**login_data)

    def test_get_all_trainings(self):
        response = self.client.get(get_list_url())
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 2)
        returned_ids = {
            training["id"] for training in response.data["results"]
        }
        expected_ids = {
            self.training.pk,
            self.training_second.pk,
        }
        self.assertEqual(returned_ids, expected_ids)

    def test_get_single_training(self):
        response = self.client.get(get_detail_url(self.training.pk))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], self.training.pk)
        self.assertEqual(response.data["owner"], self.training.owner)
        self.assertEqual(response.data["conducted"], self.training.conducted)
        self.assertEqual(response.data["template"], self.training.template.pk)
        self.assertEqual(response.data["title"], self.training.title)
        self.assertEqual(
            response.data["description"], self.training.description
        )
        self.assertEqual(response.data["notes"], self.training.notes)
        exercises = Exercise.objects.filter(training=self.training)
        for i in range(2):
            self.assertEqual(
                response.data["exercises"][i]["id"], exercises[i].pk
            )
            self.assertEqual(
                response.data["exercises"][i]["Template"], exercises[i].pk
            )
            self.assertEqual(
                response.data["exercises"][i]["Order"], exercises[i].order
            )
            self.assertEqual(
                response.data["exercises"][i]["Units"], exercises[i].units
            )
            self.assertEqual(
                response.data["exercises"][i]["Sets"], exercises[i].sets
            )

    def test_get_other_user_training(self):
        response = self.client.get(get_detail_url(self.training_other_user.pk))
        self.assertEqual(response.status_code, 403)

    def test_create_training(self):
        response = self.client.post(get_create_url(), self.new_training_data)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Training.objects.count(), 4)
        self.assertEqual(Training.objects.count(), 4)
        training = Training.objects.filter(
            title=self.new_training_data["title"]
        )
        self.assertEqual(training.count(), 1)
        exercises = Exercise.objects.filter(training=training)
        self.assertEqual(exercises.count(), 2)
        self.assertEqual(exercises[0].template, self.exercise_template_first)
        self.assertEqual(exercises[1].template, self.exercise_template_admin)

    def test_edit_training(self):
        response = self.client.put(
            get_detail_url(self.training.pk), {self.new_training_data}
        )
        self.assertEqual(response.status_code, 200)
        self.training.refresh_from_db()
        self.assertEqual(self.training.title, self.new_training_data["title"])
        self.assertEqual(
            self.training.exercises[0].units,
            self.new_training_data["exercises_data"][0]["Units"],
        )

    def test_edit_other_user_training(self):
        response = self.client.put(
            get_detail_url(self.training_other_user.pk),
            {self.new_training_data},
        )
        self.assertEqual(response.status_code, 403)

    def test_delete_training(self):
        response = self.client.delete(get_detail_url(self.training.pk))
        self.assertEqual(response.status_code, 204)
        self.assertFalse(Training.objects.filter(pk=self.training.pk).exists())

    def test_delete_other_user_training(self):
        response = self.client.delete(
            get_detail_url(self.training_other_user.pk)
        )
        self.assertEqual(response.status_code, 403)
