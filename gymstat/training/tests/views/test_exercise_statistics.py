import copy
import datetime

from rest_framework.test import APITestCase

from django.contrib.auth import get_user_model

from user.tests import login_data, other_user_data, user_data
from ...models import ExerciseTemplate, Training


User = get_user_model()


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