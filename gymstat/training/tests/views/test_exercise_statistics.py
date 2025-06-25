import copy
import datetime

from rest_framework.test import APITestCase
from freezegun import freeze_time
from urllib.parse import urlencode

from django.contrib.auth import get_user_model
from django.urls import reverse

from user.tests import login_data, other_user_data, user_data
from ...models import ExerciseTemplate, Training


User = get_user_model()


def get_url(pk: int, field: str, period: str, period_quantity: int):
    base_url = reverse("training:exercise-statistics", kwargs={"pk": pk})
    query = {
        "period": period,
        "period_quantity": period_quantity,
        "field": field,
    }
    return f"{base_url}?{urlencode(query)}"


def create_training(test_case, **kwargs):
    def get_default_exercise_data():
        return [{
            "template": test_case.exercise_template,
            "order": 1,
            "units": {"weight": "kg"},
            "sets": [
                {
                    "weight": "80",
                },
            ]
        }]

    defaults = {
        "owner": test_case.user,
        "conducted": datetime.datetime(2024, 1, 1, tzinfo=datetime.timezone.utc),
        "exercises_data": get_default_exercise_data()
    }
    if "weight" in kwargs and "exercise_data" not in kwargs:
        modified_exercise_data = copy.deepcopy(defaults["exercises_data"])
        modified_exercise_data[0]["sets"][0]['weight'] = str(kwargs.pop("weight"))
        defaults["exercises_data"] = modified_exercise_data
    defaults.update(kwargs)
    return Training.objects.create_training(**defaults)


class ExericseStatisticsAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(**user_data)
        self.other_user = User.objects.create_user(**other_user_data)

        self.exercise_template = ExerciseTemplate.objects.create(
            name="Bench press",
            owner=self.user,
            fields=["weight"],
        )
        self.client.login(**login_data)

    @freeze_time("2025-06-01")
    def test_get_exercise_history_for_10_days(self):
        create_training(
            self,
            weight=50,
            conduncted=datetime.datetime.now(tz=datetime.timezone.utc) - datetime.timedelta(days=15)
        )
        create_training(
            self,
            weight=60,
            conduncted=datetime.datetime.now(tz=datetime.timezone.utc) - datetime.timedelta(days=8)
        )
        create_training(
            self,
            weight=70,
            conduncted=datetime.datetime.now(tz=datetime.timezone.utc) - datetime.timedelta(days=5)
        )
        create_training(
            self,
            weight=100,
            conduncted=datetime.datetime.now(tz=datetime.timezone.utc)
        )

        response = self.client.get(get_url(
            self.exercise_template,
            period="day",
            period_quantity=10,
            field="weight",
        ))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 3)
        returned_weights = {exercise["weight"] for exercise in response.data["results"]}
        expected_weights = {"60", "70", "100"}
        self.assertEqual(returned_weights, expected_weights)

    @freeze_time("2025-06-01")
    def test_get_exercises_history_for_6_weeks(self):
        create_training(
            self,
            weight=50,
            conduncted=datetime.datetime.now(tz=datetime.timezone.utc) - datetime.timedelta(weeks=7)
        )
        create_training(
            self,
            weight=70,
            conduncted=datetime.datetime.now(tz=datetime.timezone.utc) - datetime.timedelta(weeks=5)
        )
        create_training(
            self,
            weight=90,
            conduncted=datetime.datetime.now(tz=datetime.timezone.utc) - datetime.timedelta(weeks=3)
        )
        create_training(
            self,
            weight=100,
            conduncted=datetime.datetime.now(tz=datetime.timezone.utc) - datetime.timedelta(days=2)
        )
        create_training(
            self,
            weight=120,
            conduncted=datetime.datetime.now(tz=datetime.timezone.utc)
        )
        response = self.client.get(get_url(
            self.exercise_template,
            period="week",
            period_quantity=6,
            field="weight",
        ))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 4)
        returned_weights = {exercise["weight"] for exercise in response.data["results"]}
        expected_weights = {"70", "90", "100", "120"}
        self.assertEqual(returned_weights, expected_weights)

    @freeze_time("2025-06-01")
    def test_get_exercises_history_for_3_months(self):
        create_training(
            self,
            weight=50,
            conduncted=datetime.datetime.now(tz=datetime.timezone.utc) - datetime.timedelta(weeks=15)
        )
        create_training(
            self,
            weight=70,
            conduncted=datetime.datetime.now(tz=datetime.timezone.utc) - datetime.timedelta(weeks=12)
        )
        create_training(
            self,
            weight=90,
            conduncted=datetime.datetime.now(tz=datetime.timezone.utc) - datetime.timedelta(weeks=5)
        )
        create_training(
            self,
            weight=100,
            conduncted=datetime.datetime.now(tz=datetime.timezone.utc) - datetime.timedelta(days=2)
        )
        create_training(
            self,
            weight=120,
            conduncted=datetime.datetime.now(tz=datetime.timezone.utc)
        )
        response = self.client.get(get_url(
            self.exercise_template,
            period="month",
            period_quantity=3,
            field="weight",
        ))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 4)
        returned_weights = {exercise["weight"] for exercise in response.data["results"]}
        expected_weights = {"70", "90", "100", "120"}
        self.assertEqual(returned_weights, expected_weights)
