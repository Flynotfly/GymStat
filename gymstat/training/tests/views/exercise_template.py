from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from urllib.parse import urlencode

from user.tests import user_data, other_user_data, admin_user_data, login_data

from ...models import ExerciseTemplate


User = get_user_model()


def get_list_url(
        exercise_type: str | None = None,
        tags: list[str] | None = None,
        fields: list[str] | None = None,
        search: str | None = None,
) -> str:
    base_url = reverse("training:exercise-template-list-create")
    query = {}
    if exercise_type:
        query["type"] = exercise_type
    if tags:
        query["tags"] = ",".join(tags)
    if fields:
        query["fields"] = ",".join(fields)
    if search:
        query["search"] = search
    if query:
        return f"{base_url}?{urlencode(query)}"
    return base_url


def get_create_url():
    return reverse("training:exercise-template-list-create")


def get_detail_url(pk: int):
    return reverse("training:exercise-template-detail", kwargs={"pk": pk})


class ExericseTemplateAPITestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(**user_data)
        self.other_user = User.objects.create_user(**other_user_data)
        self.admin_user = User.objects.create_user(**admin_user_data)

        self.bench_exercise = ExerciseTemplate.objects.create(
            name="Bench press",
            owner=self.user,
            fields=["Sets", "Reps", "Weight", "Time"],
            tags=["chest", "triceps", "free weight"],
            description="It is the best exercise",
        )
        self.best_exericse = ExerciseTemplate.objects.create(
            name="Best exercise",
            owner=self.user,
            fields=["Sets", "Reps", "Weight", "Time"],
            tags=["chest", "free weight"],
            description="Second Exercise",
        )
        self.leg_exercise = ExerciseTemplate.objects.create(
            name="Leg press",
            owner=self.user,
            fields=["Sets", "Reps", "Rest", "Notes"],
            tags=["legs"],
        )
        self.no_tags_exercise = ExerciseTemplate.objects.create(
            name="No tags",
            owner=self.user,
            fields=["Sets", "Reps", "Rounds"],
            description="Unrelevant description"
        )
        self.unactive_exercise = ExerciseTemplate.objects.create(
            name="Bench press",
            owner=self.user,
            fields=["Sets", "Reps", "Weight", "Time"],
            tags=["chest", "triceps", "free weight"],
            description="It is the best exercise",
            is_active=False,
        )

        self.admin_bench_exercise = ExerciseTemplate.objects.create(
            name="Bench abs",
            owner=self.admin_user,
            fields=["Sets", "Reps", "Weight", "Time"],
            tags=["chest", "triceps", "free weight"],
            description="Abs exercise that we will do on bench like bench press",
            is_admin=True,
        )
        self.admin_run_exercise = ExerciseTemplate.objects.create(
            name="Running",
            owner=self.admin_user,
            fields=["Time", "Distance"],
            tags=["running"],
            description="Running",
            is_admin=True,
        )
        self.admin_unactive_exercise = ExerciseTemplate.objects.create(
            name="Bench abs",
            owner=self.admin_user,
            fields=["Sets", "Reps", "Weight", "Time"],
            tags=["chest", "triceps", "free weight"],
            description="Abs exercise that we will do on bench like bench press",
            is_admin=True,
            is_active=False,
        )

        self.other_user_exercise = ExerciseTemplate.objects.create(
            name="Bench press",
            owner=self.other_user,
            fields=["Sets", "Reps", "Weight", "Time"],
            tags=["chest", "triceps", "free weight"],
            description="It is the best exercise",
        )

        self.new_exercise_data = {
            "name": "New exercise",
            "fields": ["Reps", "Sets", "Distance"],
            "tags": ["cardio", "cycling"],
            "descripton": "This is description for new exercise",
        }

        self.client.login(**login_data)

    # Basic CRUD
    def test_get_all_exercises(self):
        response = self.client.get(get_list_url())
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 6)
        returned_ids = {exercise["id"] for exercise in response.data["results"]}
        expected_ids = {
            self.bench_exercise.pk,
            self.best_exericse.pk,
            self.leg_exercise.pk,
            self.no_tags_exercise.pk,
            self.admin_bench_exercise.pk,
            self.admin_run_exercise.pk,
        }
        self.assertEqual(returned_ids, expected_ids)

    def test_get_user_exercise(self):
        response = self.client.get(get_detail_url(self.best_exericse.pk))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], self.best_exericse.pk)
        self.assertEqual(response.data["name"], self.best_exericse.name)

    def test_get_admin_exercise(self):
        response = self.client.get(get_detail_url(self.admin_run_exercise.pk))
        self.assertEqual(response.status_code, 403)

    def test_get_other_user_exercise(self):
        response = self.client.get(get_detail_url(self.other_user_exercise.pk))
        self.assertEqual(response.status_code, 403)

    def test_create_exercise(self):
        response = self.client.post(get_create_url(), self.new_exercise_data)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(ExerciseTemplate.objects.count(), 10)
        exercise = ExerciseTemplate.objects.filter(name=self.new_exercise_data["name"])
        self.assertEqual(exercise.count(), 1)

    def test_edit_owned_exercise(self):
        response = self.client.put(get_detail_url(self.best_exericse.pk), self.new_exercise_data)
        self.assertEqual(response.status_code, 200)
        self.best_exericse.refresh_from_db()
        self.assertEqual(self.best_exericse.name, self.new_exercise_data["name"])

    def test_edit_admin_exercise(self):
        response = self.client.put(get_detail_url(self.admin_run_exercise.pk), self.new_exercise_data)
        self.assertEqual(response.status_code, 403)

    def test_edit_other_user_exercise(self):
        response = self.client.put(get_detail_url(self.other_user_exercise.pk), self.new_exercise_data)
        self.assertEqual(response.status_code, 403)

    def test_delete_owned_exercise(self):
        response = self.client.delete(get_detail_url(self.best_exericse.pk))
        self.assertEqual(response.status_code, 204)
        self.assertFalse(
            ExerciseTemplate.objects.filter(pk=self.best_exericse.pk).exists()
        )

    def test_delete_admin_exercise(self):
        response = self.client.delete(get_detail_url(self.admin_run_exercise.pk))
        self.assertEqual(response.status_code, 403)

    def test_delete_other_user_exercise(self):
        response = self.client.delete(get_detail_url(self.other_user_exercise.pk))
        self.assertEqual(response.status_code, 403)

    # Filter by user/admin
    def test_get_user_exercises(self):
        response = self.client.get(get_list_url(exercise_type="user"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 4)
        returned_ids = {exercise["id"] for exercise in response.data["results"]}
        expected_ids = {
            self.bench_exercise.pk,
            self.best_exericse.pk,
            self.leg_exercise.pk,
            self.no_tags_exercise.pk,
        }
        self.assertEqual(returned_ids, expected_ids)

    def test_get_admin_exercises(self):
        response = self.client.get(get_list_url(exercise_type="admin"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 2)
        returned_ids = {exercise["id"] for exercise in response.data["results"]}
        expected_ids = {
            self.admin_run_exercise.pk,
            self.admin_bench_exercise.pk,
        }
        self.assertEqual(returned_ids, expected_ids)

    # Filter by tag
    def test_get_by_tag(self):
        tag = "chest"
        response = self.client.get(get_list_url(tags=[tag]))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 3)
        returned_ids = {exercise["id"] for exercise in response.data["results"]}
        expected_ids = {
            self.bench_exercise.pk,
            self.best_exericse.pk,
            self.admin_bench_exercise.pk,
        }
        self.assertEqual(returned_ids, expected_ids)
    def test_get_by_several_tags(self):
        tags = ["chest", "triceps"]
        response = self.client.get(get_list_url(tags=tags))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 2)
        returned_ids = {exercise["id"] for exercise in response.data["results"]}
        expected_ids = {
            self.bench_exercise.pk,
            self.admin_bench_exercise.pk,
        }
        self.assertEqual(returned_ids, expected_ids)
