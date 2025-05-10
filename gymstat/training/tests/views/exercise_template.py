from urllib.parse import urlencode

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase

from user.tests import admin_user_data, login_data, other_user_data, user_data

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
            fields=["sets", "reps", "weight", "time"],
            tags=["chest", "triceps", "free weight"],
            description="It is the best exercise",
        )
        self.best_exercise = ExerciseTemplate.objects.create(
            name="Best exercise",
            owner=self.user,
            fields=["sets", "reps", "weight", "time"],
            tags=["chest", "free weight"],
            description="Second Exercise",
        )
        self.leg_exercise = ExerciseTemplate.objects.create(
            name="Leg press",
            owner=self.user,
            fields=["sets", "rest", "notes"],
            tags=["legs"],
        )
        self.no_tags_exercise = ExerciseTemplate.objects.create(
            name="No tags",
            owner=self.user,
            fields=["sets", "reps", "rounds"],
            description="Unrelevant description",
        )
        self.unactive_exercise = ExerciseTemplate.objects.create(
            name="Bench press",
            owner=self.user,
            fields=["sets", "reps", "weight", "time"],
            tags=["chest", "triceps", "free weight"],
            description="It is the best exercise",
            is_active=False,
        )

        self.admin_bench_exercise = ExerciseTemplate.objects.create(
            name="Bench abs",
            owner=self.admin_user,
            fields=["sets", "reps", "weight", "time"],
            tags=["chest", "triceps", "free weight"],
            description="Abs exercise that we will do on bench like bench press",
            is_admin=True,
        )
        self.admin_run_exercise = ExerciseTemplate.objects.create(
            name="Running",
            owner=self.admin_user,
            fields=["time", "distance"],
            tags=["running"],
            description="Running",
            is_admin=True,
        )
        self.admin_unactive_exercise = ExerciseTemplate.objects.create(
            name="Bench abs",
            owner=self.admin_user,
            fields=["sets", "reps", "weight", "time"],
            tags=["chest", "triceps", "free weight"],
            description="Abs exercise that we will do on bench like bench press",
            is_admin=True,
            is_active=False,
        )

        self.other_user_exercise = ExerciseTemplate.objects.create(
            name="Bench press",
            owner=self.other_user,
            fields=["sets", "reps", "weight", "time"],
            tags=["chest", "triceps", "free weight"],
            description="It is the best exercise",
        )

        self.new_exercise_data = {
            "name": "New exercise",
            "fields": ["reps", "sets", "distance"],
            "tags": ["cardio", "cycling"],
            "description": "This is description for new exercise",
        }

        self.client.login(**login_data)

    # Basic CRUD
    def test_get_all_exercises(self):
        response = self.client.get(get_list_url())
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 6)
        returned_ids = {
            exercise["id"] for exercise in response.data["results"]
        }
        expected_ids = {
            self.bench_exercise.pk,
            self.best_exercise.pk,
            self.leg_exercise.pk,
            self.no_tags_exercise.pk,
            self.admin_bench_exercise.pk,
            self.admin_run_exercise.pk,
        }
        self.assertEqual(returned_ids, expected_ids)

    def test_get_user_exercise(self):
        response = self.client.get(get_detail_url(self.best_exercise.pk))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], self.best_exercise.pk)
        self.assertEqual(response.data["name"], self.best_exercise.name)

    def test_get_admin_exercise(self):
        response = self.client.get(get_detail_url(self.admin_run_exercise.pk))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["id"], self.admin_run_exercise.pk)
        self.assertEqual(response.data["name"], self.admin_run_exercise.name)

    def test_get_other_user_exercise(self):
        response = self.client.get(get_detail_url(self.other_user_exercise.pk))
        self.assertEqual(response.status_code, 403)

    def test_create_exercise(self):
        response = self.client.post(get_create_url(), self.new_exercise_data)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(ExerciseTemplate.objects.count(), 10)
        exercise = ExerciseTemplate.objects.filter(
            name=self.new_exercise_data["name"]
        )
        self.assertEqual(exercise.count(), 1)

    def test_edit_owned_exercise(self):
        response = self.client.put(
            get_detail_url(self.best_exercise.pk), self.new_exercise_data
        )
        self.assertEqual(response.status_code, 200)
        self.best_exercise.refresh_from_db()
        self.assertEqual(
            self.best_exercise.name, self.new_exercise_data["name"]
        )

    def test_edit_admin_exercise(self):
        response = self.client.put(
            get_detail_url(self.admin_run_exercise.pk), self.new_exercise_data
        )
        self.assertEqual(response.status_code, 403)

    def test_edit_other_user_exercise(self):
        response = self.client.put(
            get_detail_url(self.other_user_exercise.pk), self.new_exercise_data
        )
        self.assertEqual(response.status_code, 403)

    def test_delete_owned_exercise(self):
        response = self.client.delete(get_detail_url(self.best_exercise.pk))
        self.assertEqual(response.status_code, 204)
        self.assertFalse(
            ExerciseTemplate.objects.filter(pk=self.best_exercise.pk).exists()
        )

    def test_delete_admin_exercise(self):
        response = self.client.delete(
            get_detail_url(self.admin_run_exercise.pk)
        )
        self.assertEqual(response.status_code, 403)

    def test_delete_other_user_exercise(self):
        response = self.client.delete(
            get_detail_url(self.other_user_exercise.pk)
        )
        self.assertEqual(response.status_code, 403)

    # Filter by user/admin
    def test_get_user_exercises(self):
        response = self.client.get(get_list_url(exercise_type="user"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 4)
        returned_ids = {
            exercise["id"] for exercise in response.data["results"]
        }
        expected_ids = {
            self.bench_exercise.pk,
            self.best_exercise.pk,
            self.leg_exercise.pk,
            self.no_tags_exercise.pk,
        }
        self.assertEqual(returned_ids, expected_ids)

    def test_get_admin_exercises(self):
        response = self.client.get(get_list_url(exercise_type="admin"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 2)
        returned_ids = {
            exercise["id"] for exercise in response.data["results"]
        }
        expected_ids = {
            self.admin_run_exercise.pk,
            self.admin_bench_exercise.pk,
        }
        self.assertEqual(returned_ids, expected_ids)

    def test_get_with_type_all(self):
        response = self.client.get(get_list_url(exercise_type="all"))
        self.assertEqual(response.status_code, 200)
        sample_response = self.client.get(get_list_url())
        self.assertEqual(sample_response.status_code, 200)
        self.assertEqual(list(response), list(sample_response))

    # Filter by type
    def test_get_by_tag(self):
        tag = "chest"
        response = self.client.get(get_list_url(tags=[tag]))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 3)
        returned_ids = {
            exercise["id"] for exercise in response.data["results"]
        }
        expected_ids = {
            self.bench_exercise.pk,
            self.best_exercise.pk,
            self.admin_bench_exercise.pk,
        }
        self.assertEqual(returned_ids, expected_ids)

    def test_get_by_several_tags(self):
        tags = ["chest", "triceps"]
        response = self.client.get(get_list_url(tags=tags))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 2)
        returned_ids = {
            exercise["id"] for exercise in response.data["results"]
        }
        expected_ids = {
            self.bench_exercise.pk,
            self.admin_bench_exercise.pk,
        }
        self.assertEqual(returned_ids, expected_ids)

    # Filter by fields
    def test_get_by_field(self):
        field = "reps"
        response = self.client.get(get_list_url(fields=[field]))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 4)
        returned_ids = {
            exercise["id"] for exercise in response.data["results"]
        }
        expected_ids = {
            self.bench_exercise.pk,
            self.best_exercise.pk,
            self.no_tags_exercise.pk,
            self.admin_bench_exercise.pk,
        }
        self.assertEqual(returned_ids, expected_ids)

    def test_get_by_fields(self):
        fields = ["reps", "weight"]
        response = self.client.get(get_list_url(fields=fields))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 3)
        returned_ids = {
            exercise["id"] for exercise in response.data["results"]
        }
        expected_ids = {
            self.bench_exercise.pk,
            self.best_exercise.pk,
            self.admin_bench_exercise.pk,
        }
        self.assertEqual(returned_ids, expected_ids)

    # Filter by type, tags and fields
    def test_complex_filter(self):
        exercise_type = "user"
        tags = ["chest", "free weight"]
        fields = ["sets", "reps"]
        response = self.client.get(
            get_list_url(exercise_type=exercise_type, tags=tags, fields=fields)
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 2)
        returned_ids = {
            exercise["id"] for exercise in response.data["results"]
        }
        expected_ids = {
            self.bench_exercise.pk,
            self.best_exercise.pk,
        }
        self.assertEqual(returned_ids, expected_ids)

    def test_complex_filter_2(self):
        exercise_type = "admin"
        tags = ["running"]
        fields = ["time"]
        response = self.client.get(
            get_list_url(exercise_type=exercise_type, tags=tags, fields=fields)
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(
            response.data["results"][0]["id"], self.admin_run_exercise.pk
        )
        self.assertEqual(
            response.data["results"][0]["name"], self.admin_run_exercise.name
        )

    # Search tests
    def test_search(self):
        search = "bench press"
        response = self.client.get(get_list_url(search=search))
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["count"] >= 2)
        self.assertEqual(
            response.data["results"][0]["id"], self.bench_exercise.pk
        )
        self.assertEqual(
            response.data["results"][1]["id"], self.admin_bench_exercise.pk
        )

    def test_search_2(self):
        search = "exercise"
        response = self.client.get(get_list_url(search=search))
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["count"] >= 3)
        self.assertEqual(
            response.data["results"][0]["id"], self.best_exercise.pk
        )
        # check 2 and 3 returned templates
        returned_ids = {
            response.data["results"][1]["id"],
            response.data["results"][2]["id"],
        }
        expected_ids = {
            self.bench_exercise.pk,
            self.admin_bench_exercise.pk,
        }
        self.assertEqual(returned_ids, expected_ids)

    # All filters and search at the same time
    def test_filters_and_search(self):
        exercise_type = "user"
        tags = ["chest", "free weight"]
        fields = ["sets", "reps"]
        search = "exercise"
        response = self.client.get(
            get_list_url(
                exercise_type=exercise_type,
                tags=tags,
                fields=fields,
                search=search,
            )
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 2)
        self.assertEqual(
            response.data["results"][0]["id"], self.best_exercise.pk
        )
        self.assertEqual(
            response.data["results"][1]["id"], self.bench_exercise.pk
        )
