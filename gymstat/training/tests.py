from datetime import date, datetime, time

from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Exercise, ExerciseType, Training

User = get_user_model()


class TrainingCreateViewTests(APITestCase):
    def setUp(self):
        # Create two users: one for the test and another as a different owner.
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

        # Create exercise types:
        # 1. Base exercise type (allowed for any user)
        self.base_exercise_type = ExerciseType.objects.create(
            owner=self.other_user,
            name="Base Exercise",
            base=True,
            iconId=1,
            iconColor="blue",
        )

        # 2. Owned exercise type (owned by test user)
        self.owned_exercise_type = ExerciseType.objects.create(
            owner=self.user,
            name="User Owned Exercise",
            base=False,
            iconId=2,
            iconColor="red",
        )

        # 3. Not owned and not base exercise type (should cause a validation error)
        self.not_owned_exercise_type = ExerciseType.objects.create(
            owner=self.other_user,
            name="Not Owned Exercise",
            base=False,
            iconId=3,
            iconColor="green",
        )

        # URL for creating a training using the name "training:api:create-training"
        self.url = reverse("training:api:create-training")

    def test_create_training_success(self):
        """Test training creation works when exercise types are valid."""
        self.client.login(email="test@example.com", password="testpass")
        payload = {
            "title": "Morning Training",
            "description": "Workout session",
            "score": 15,
            "date": "2025-03-20",
            "time": "07:30:00",
            "sets": [
                {
                    "index": 1,
                    "exerciseType": self.base_exercise_type.id,
                    "exerciseName": "Push Up",
                    "exercises": [
                        {"index": 1, "repetitions": 15, "weight": "0.00"}
                    ],
                },
                {
                    "index": 2,
                    "exerciseType": self.owned_exercise_type.id,
                    "exerciseName": "Squat",
                    "exercises": [
                        {"index": 1, "repetitions": 12, "weight": "50.00"}
                    ],
                },
            ],
        }
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # Verify that the training was created.
        self.assertEqual(Training.objects.count(), 1)
        training = Training.objects.first()
        self.assertEqual(training.owner, self.user)
        self.assertEqual(training.title, payload["title"])
        self.assertEqual(training.score, payload["score"])
        # Two sets (each with one exercise) should result in two Exercise records.
        self.assertEqual(Exercise.objects.filter(training=training).count(), 2)

    def test_create_training_fail_invalid_exercise_type(self):
        """Test training creation fails when an exercise type is neither owned by the user nor base."""
        self.client.login(email="test@example.com", password="testpass")
        payload = {
            "title": "Evening Training",
            "description": "Workout session",
            "score": 20,
            "date": "2025-03-20",
            "time": "18:00:00",
            "sets": [
                {
                    "index": 1,
                    "exerciseType": self.not_owned_exercise_type.id,
                    "exerciseName": "Bench Press",
                    "exercises": [
                        {"index": 1, "repetitions": 10, "weight": "80.00"}
                    ],
                }
            ],
        }
        response = self.client.post(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # Ensure no training is created.
        self.assertEqual(Training.objects.count(), 0)
        # Check that the error message indicates lack of authorization.
        self.assertIn("Not authorized", str(response.data))


class TrainingUpdateViewTests(APITestCase):
    def setUp(self):
        # Create two users: one for the test and another as a different owner.
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

        # Create exercise types:
        # 1. Base exercise type (allowed for any user)
        self.base_exercise_type = ExerciseType.objects.create(
            owner=self.other_user,
            name="Base Exercise",
            base=True,
            iconId=1,
            iconColor="blue",
        )

        # 2. Owned exercise type (owned by test user)
        self.owned_exercise_type = ExerciseType.objects.create(
            owner=self.user,
            name="User Owned Exercise",
            base=False,
            iconId=2,
            iconColor="red",
        )

        # 3. Not owned and not base exercise type (should cause a validation error)
        self.not_owned_exercise_type = ExerciseType.objects.create(
            owner=self.other_user,
            name="Not Owned Exercise",
            base=False,
            iconId=3,
            iconColor="green",
        )

        # Create an existing training owned by test user
        conducted_datetime = timezone.make_aware(
            datetime.combine(date(2025, 3, 20), time(7, 30, 0))
        )
        self.training = Training.objects.create(
            owner=self.user,
            title="Morning Training",
            description="Initial workout session",
            score=15,
            conducted=conducted_datetime,
        )
        # Create an initial exercise for the training.
        Exercise.objects.create(
            training=self.training,
            exercise_type=self.base_exercise_type,
            order=1,
            suborder=1,
            weight="0.00",
            repetitions=15,
        )

        # URL for updating a training using the name "training:api:update-training"
        self.url = reverse(
            "training:api:update-training", kwargs={"pk": self.training.id}
        )

    def test_update_training_success(self):
        """Test training update works with valid exercise types."""
        self.client.login(email="test@example.com", password="testpass")
        payload = {
            "title": "Updated Morning Training",
            "description": "Updated workout session",
            "score": 20,
            "date": "2025-03-20",
            "time": "08:00:00",
            "sets": [
                {
                    "index": 1,
                    "exerciseType": self.base_exercise_type.id,
                    "exerciseName": "Push Up Updated",
                    "exercises": [
                        {"index": 1, "repetitions": 20, "weight": "0.00"}
                    ],
                },
                {
                    "index": 2,
                    "exerciseType": self.owned_exercise_type.id,
                    "exerciseName": "Squat Updated",
                    "exercises": [
                        {"index": 1, "repetitions": 15, "weight": "50.00"}
                    ],
                },
            ],
        }
        response = self.client.put(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Refresh the training instance from the DB.
        self.training.refresh_from_db()
        self.assertEqual(self.training.title, payload["title"])
        self.assertEqual(self.training.description, payload["description"])
        self.assertEqual(self.training.score, payload["score"])
        # Check that exercises were re-created. Expect 2 new Exercise records.
        exercises_count = Exercise.objects.filter(
            training=self.training
        ).count()
        self.assertEqual(exercises_count, 2)

    def test_update_training_fail_invalid_exercise_type(self):
        """Test training update fails when an exercise type is invalid."""
        self.client.login(email="test@example.com", password="testpass")
        payload = {
            "title": "Updated Training with Invalid Exercise",
            "description": "Workout session with invalid exercise type",
            "score": 25,
            "date": "2025-03-20",
            "time": "09:00:00",
            "sets": [
                {
                    "index": 1,
                    "exerciseType": self.not_owned_exercise_type.id,
                    "exerciseName": "Bench Press",
                    "exercises": [
                        {"index": 1, "repetitions": 10, "weight": "80.00"}
                    ],
                }
            ],
        }
        response = self.client.put(self.url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # Ensure the training has not been updated.
        self.training.refresh_from_db()
        self.assertNotEqual(self.training.title, payload["title"])
        # Check that the error message indicates lack of authorization.
        self.assertIn("Not authorized", str(response.data))
