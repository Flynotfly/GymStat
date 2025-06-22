import datetime

from rest_framework.test import APITestCase

from django.contrib.auth import get_user_model

from user.tests import login_data, other_user_data, user_data
from ...models import ExerciseTemplate, Training


User = get_user_model()


class ExericseStatisticsAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(**user_data)
        self.other_user = User.objects.create_user(**other_user_data)

        self.exercise_template = ExerciseTemplate.objects.create(
            name="Bench press",
            owner=self.user,
            fields=["weight"],
        )
        self.other_exercise_template = ExerciseTemplate.objects.create(
            name="Other exercise",
            owner=self.user,
            fields=["weight"],
        )
        self.other_user_exercise_template = ExerciseTemplate.objects.create(
            name="Other user exercise",
            owner=self.other_user,
            fields=["weight"]
        )

        self.trainings = []
        self.trainings.append(Training.objects.create_training(
            owner=self.user,
            conducted=datetime.datetime(2025, 5, 10),
            exercises_data=[{
                "template": self.exercise_template,
                "order": 1,
                "units": {"weight": "kg"},
                "sets": [
                    {
                        "weight": "80",
                    },
                ]
            }]
        ))
        self.client.login(**login_data)
