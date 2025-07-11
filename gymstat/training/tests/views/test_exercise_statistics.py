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


def get_url(
        pk: int,
        field: str,
        period: str,
        period_quantity: int,
        unit: str | None = None,
):
    base_url = reverse("training:exercise-statistics", kwargs={"pk": pk})
    query = {
        "period": period,
        "period_quantity": period_quantity,
        "field": field,
    }
    if unit:
        query["unit"] = unit
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
    if "weight" in kwargs and "exercises_data" not in kwargs:
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
            conducted=datetime.datetime.now(tz=datetime.timezone.utc) - datetime.timedelta(days=15)
        )
        create_training(
            self,
            weight=60,
            conducted=datetime.datetime.now(tz=datetime.timezone.utc) - datetime.timedelta(days=8)
        )
        create_training(
            self,
            weight=70,
            conducted=datetime.datetime.now(tz=datetime.timezone.utc) - datetime.timedelta(days=5)
        )
        create_training(
            self,
            weight=100,
            conducted=datetime.datetime.now(tz=datetime.timezone.utc)
        )

        response = self.client.get(get_url(
            self.exercise_template.pk,
            period="day",
            period_quantity=10,
            field="weight",
            unit="kg",
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
            conducted=datetime.datetime.now(tz=datetime.timezone.utc) - datetime.timedelta(weeks=7)
        )
        create_training(
            self,
            weight=70,
            conducted=datetime.datetime.now(tz=datetime.timezone.utc) - datetime.timedelta(weeks=5)
        )
        create_training(
            self,
            weight=90,
            conducted=datetime.datetime.now(tz=datetime.timezone.utc) - datetime.timedelta(weeks=3)
        )
        create_training(
            self,
            weight=100,
            conducted=datetime.datetime.now(tz=datetime.timezone.utc) - datetime.timedelta(days=2)
        )
        create_training(
            self,
            weight=120,
            conducted=datetime.datetime.now(tz=datetime.timezone.utc)
        )
        response = self.client.get(get_url(
            self.exercise_template.pk,
            period="week",
            period_quantity=6,
            field="weight",
            unit="kg",
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
            conducted=datetime.datetime.now(tz=datetime.timezone.utc) - datetime.timedelta(weeks=15)
        )
        create_training(
            self,
            weight=70,
            conducted=datetime.datetime.now(tz=datetime.timezone.utc) - datetime.timedelta(weeks=12)
        )
        create_training(
            self,
            weight=90,
            conducted=datetime.datetime.now(tz=datetime.timezone.utc) - datetime.timedelta(weeks=5)
        )
        create_training(
            self,
            weight=100,
            conducted=datetime.datetime.now(tz=datetime.timezone.utc) - datetime.timedelta(days=2)
        )
        create_training(
            self,
            weight=120,
            conducted=datetime.datetime.now(tz=datetime.timezone.utc)
        )
        response = self.client.get(get_url(
            self.exercise_template.pk,
            period="month",
            period_quantity=3,
            field="weight",
            unit="kg",
        ))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 4)
        returned_weights = {exercise["weight"] for exercise in response.data["results"]}
        expected_weights = {"70", "90", "100", "120"}
        self.assertEqual(returned_weights, expected_weights)

    @freeze_time("2025-06-01")
    def test_get_exercise_history_several_fields(self):
        exercise_template = ExerciseTemplate.objects.create(
            name="Press",
            owner=self.user,
            fields=["weight", "reps"],
        )
        create_training(
            self,
            conducted=datetime.datetime.now(tz=datetime.timezone.utc) - datetime.timedelta(days=2),
            exercises_data=[{
                "template": exercise_template,
                "order": 1,
                "units": {"weight": "kg"},
                "sets": [
                    {
                        "weight": "80",
                        "reps": 4,
                    },
                ]
            }]
        )
        create_training(
            self,
            conducted=datetime.datetime.now(tz=datetime.timezone.utc),
            exercises_data=[{
                "template": exercise_template,
                "order": 1,
                "units": {"weight": "kg"},
                "sets": [
                    {
                        "weight": "80",
                        "reps": 7,
                    },
                ]
            }]
        )

        response = self.client.get(get_url(
            exercise_template,
            period="day",
            period_quantity=5,
            field="reps",
        ))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 2)
        returned_weights = {exercise["reps"] for exercise in response.data["results"]}
        expected_weights = {"4", "7"}
        self.assertEqual(returned_weights, expected_weights)

    @freeze_time("2025-06-01")
    def test_get_exercise_history_several_trainings_in_one_day(self):
        create_training(
            self,
            weight=100,
            conducted=datetime.datetime.now(tz=datetime.timezone.utc)
        )
        create_training(
            self,
            weight=120,
            conducted=datetime.datetime.now(tz=datetime.timezone.utc)
        )
        create_training(
            self,
            conducted=datetime.datetime.now(tz=datetime.timezone.utc),
            exercises_data=[{
                "template": self.exercise_template,
                "order": 1,
                "units": {"weight": "kg"},
                "sets": [
                    {
                        "weight": "80",
                    },
                    {
                        "weight": "140",
                    }
                ]
            }]
        )
        create_training(
            self,
            owner=self.other_user,
            weight=200,
            conducted=datetime.datetime.now(tz=datetime.timezone.utc)
        )

        wrong_exercise_template = ExerciseTemplate.objects.create(
            name="Press",
            owner=self.user,
            fields=["weight", "reps"],
        )
        create_training(
            self,
            conducted=datetime.datetime.now(tz=datetime.timezone.utc),
            exercises_data=[{
                "template": wrong_exercise_template,
                "order": 1,
                "units": {"weight": "kg"},
                "sets": [
                    {
                        "weight": "200",
                        "reps": 7,
                    },
                ]
            }]
        )

        response = self.client.get(get_url(
            self.exercise_template.pk,
            period="day",
            period_quantity=3,
            field="weight",
            unit="kg",
        ))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["weight"], "140")

    @freeze_time("2025-06-01")
    def test_get_exercise_history_with_unit_conversion(self):
        create_training(
            self,
            weight=100,
            conducted=datetime.datetime.now(tz=datetime.timezone.utc) - datetime.timedelta(days=2),
        )
        create_training(
            self,
            conducted=datetime.datetime.now(tz=datetime.timezone.utc) - datetime.timedelta(days=2),
            exercises_data=[{
                "template": self.exercise_template,
                "order": 1,
                "units": {"weight": "lbs"},
                "sets": [
                    {
                        "weight": "176.37",
                    },
                ]
            }]
        )
        response_kg = self.client.get(get_url(
            self.exercise_template.pk,
            period="day",
            period_quantity=3,
            field="weight",
            unit="kg",
        ))
        self.assertEqual(response_kg.status_code, 200)
        self.assertEqual(response_kg.data["count"], 2)
        returned_weights_kg = {round(float(exercise["weight"])) for exercise in response_kg.data["results"]}
        expected_weights_kg = {100.00, 80.00}
        self.assertEqual(returned_weights_kg, expected_weights_kg)

        response_lbs = self.client.get(get_url(
            self.exercise_template.pk,
            period="day",
            period_quantity=3,
            field="weight",
            unit="lbs",
        ))
        self.assertEqual(response_lbs.status_code, 200)
        self.assertEqual(response_lbs.data["count"], 2)
        returned_weights_lbs = {round(float(exercise["weight"])) for exercise in response_lbs.data["results"]}
        expected_weights_lbs = {220.46, 176.37}
        self.assertEqual(returned_weights_lbs, expected_weights_lbs)
