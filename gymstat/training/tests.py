from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.test import TestCase
from django.utils import timezone

from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse

from .models import ExerciseTemplate, Training, TrainingTemplate

User = get_user_model()


class ExerciseTemplateModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="testuser@email.com",
            password="password123",
            first_name="Bob",
            last_name="Smith",
        )

    def test_valid_fields(self):
        template = ExerciseTemplate(
            name="Valid Exercise Template",
            owner=self.user,
            fields=["Sets", "Reps", "Weight", "Tempo"],
            description="A valid template",
        )

        try:
            template.full_clean()  # should not raise an error
        except ValidationError:
            self.fail(
                "template.full_clean() raised ValidationError unexpectedly!"
            )

        template.save()
        self.assertEqual(ExerciseTemplate.objects.count(), 1)

    def test_invalid_field_name(self):
        template = ExerciseTemplate(
            name="Invalid Exercise Template",
            owner=self.user,
            fields=["InvalidField", "Sets"],
            description="This should fail due to invalid field",
        )

        with self.assertRaises(ValidationError) as context:
            template.full_clean()

        self.assertIn("Invalid fields provided", str(context.exception))

    def test_fields_as_non_list(self):
        template = ExerciseTemplate(
            name="Non-List Fields Template",
            owner=self.user,
            fields={"Sets": True},  # Passing a dict instead of a list
            description="This should fail due to incorrect data type",
        )

        with self.assertRaises(ValidationError) as context:
            template.full_clean()

        self.assertIn("Fields must be a list.", str(context.exception))

    def test_empty_fields_list(self):
        template = ExerciseTemplate(
            name="Empty Fields Template",
            owner=self.user,
            fields=[],  # An empty list should not be allowed
            description="This should fail because empty fields are not permitted",
        )

        with self.assertRaises(ValidationError) as context:
            template.full_clean()

        # Assert that the error message indicates that the field cannot be blank.
        self.assertIn("This field cannot be blank", str(context.exception))

    def test_fields_duplicate_entries(self):
        template = ExerciseTemplate(
            name="Duplicate Fields Template",
            owner=self.user,
            fields=["Sets", "Sets", "Reps"],
            description="Duplicates should be allowed unless explicitly forbidden",
        )

        try:
            template.full_clean()  # duplicates are not explicitly disallowed
        except ValidationError:
            self.fail(
                "template.full_clean() raised ValidationError unexpectedly for duplicate fields!"
            )

        template.save()
        self.assertEqual(ExerciseTemplate.objects.count(), 1)


class ExerciseTemplateAPITests(APITestCase):
    def setUp(self):
        # Create users
        self.user = User.objects.create_user(
            email='user@example.com',
            password='password123',
            first_name='Test',
            last_name='User'
        )
        self.other_user = User.objects.create_user(
            email='other@example.com',
            password='password123',
            first_name='Other',
            last_name='User'
        )

        # Create admin template
        self.admin_template = ExerciseTemplate.objects.create(
            name='Bench Press',
            owner=self.other_user,
            fields=['reps', 'weight'],
            description='Admin bench press template',
            is_admin=True
        )

        # Create user template
        self.user_template = ExerciseTemplate.objects.create(
            name='User Squat',
            owner=self.user,
            fields=['reps', 'weight'],
            description='User squat template'
        )

        # URLs
        self.list_create_url = reverse('training:exercise-template-list-create')
        self.detail_url = lambda pk: reverse('training:exercise-template-detail', args=[pk])

    def test_get_admin_templates(self):
        self.client.login(email='user@example.com', password='password123')
        response = self.client.get(self.list_create_url, {'type': 'admin'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'Bench Press')

    def test_get_user_templates(self):
        self.client.login(email='user@example.com', password='password123')
        response = self.client.get(self.list_create_url, {'type': 'user'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['name'], 'User Squat')

    def test_get_all_templates(self):
        self.client.login(email='user@example.com', password='password123')
        response = self.client.get(self.list_create_url, {'type': 'all'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_create_template(self):
        self.client.login(email='user@example.com', password='password123')
        data = {
            'name': 'New Exercise',
            'fields': ['Time', 'Distance'],
            'description': 'Test description'
        }
        response = self.client.post(self.list_create_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ExerciseTemplate.objects.count(), 3)
        new_template = ExerciseTemplate.objects.get(name='New Exercise')
        self.assertEqual(new_template.owner, self.user)

    def test_create_invalid_template(self):
        self.client.login(email='user@example.com', password='password123')
        data = {
            'name': 'Invalid Exercise',
            'fields': ['invalid_field'],
            'description': 'Invalid fields'
        }
        response = self.client.post(self.list_create_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Invalid fields provided', str(response.data))

    def test_retrieve_own_template(self):
        self.client.login(email='user@example.com', password='password123')
        response = self.client.get(self.detail_url(self.user_template.pk))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'User Squat')

    def test_retrieve_admin_template(self):
        self.client.login(email='user@example.com', password='password123')
        response = self.client.get(self.detail_url(self.admin_template.pk))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Bench Press')

    def test_update_own_template(self):
        self.client.login(email='user@example.com', password='password123')
        data = {'description': 'Updated description'}
        response = self.client.patch(self.detail_url(self.user_template.pk), data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user_template.refresh_from_db()
        self.assertEqual(self.user_template.description, 'Updated description')

    def test_update_admin_template_forbidden(self):
        self.client.login(email='user@example.com', password='password123')
        data = {'description': 'Hacked description'}
        response = self.client.patch(self.detail_url(self.admin_template.pk), data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_own_template(self):
        self.client.login(email='user@example.com', password='password123')
        response = self.client.delete(self.detail_url(self.user_template.pk))
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(ExerciseTemplate.objects.filter(pk=self.user_template.pk).exists())

    def test_delete_admin_template_forbidden(self):
        self.client.login(email='user@example.com', password='password123')
        response = self.client.delete(self.detail_url(self.admin_template.pk))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_access(self):
        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        response = self.client.post(self.list_create_url, {'name': 'Unauthorized'})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        response = self.client.get(self.detail_url(self.user_template.pk))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class TrainingModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="test@example.com",
            password="securepass123",
            first_name="John",
            last_name="Doe"
        )

        self.template = TrainingTemplate.objects.create(
            owner=self.user,
            name="Strength Training",
            description="A basic strength routine",
            data={"duration": "60 minutes", "difficulty": "Intermediate"}
        )

        self.valid_notes = {
            "description": "Good progress today.",
            "score": "8"
        }

    def test_training_creation_with_valid_data(self):
        training = Training.objects.create(
            owner=self.user,
            template=self.template,
            conducted=timezone.now(),
            title="Morning Workout",
            notes=self.valid_notes
        )

        self.assertEqual(training.owner, self.user)
        self.assertEqual(training.template, self.template)
        self.assertEqual(training.notes, self.valid_notes)
        self.assertEqual(str(training), f"Morning Workout by {self.user} on {training.conducted.strftime('%Y-%m-%d')}")

    def test_training_creation_with_no_template(self):
        training = Training.objects.create(
            owner=self.user,
            conducted=timezone.now(),
            title=None,
            notes=None
        )

        self.assertIsNone(training.template)
        self.assertEqual(training.title, None)
        self.assertEqual(training.notes, None)
        self.assertEqual(str(training), f"Untitled Training by {self.user} on {training.conducted.strftime('%Y-%m-%d')}")

    def test_training_notes_invalid_type(self):
        invalid_notes = ["not", "a", "dictionary"]

        training = Training(
            owner=self.user,
            conducted=timezone.now(),
            notes=invalid_notes
        )

        with self.assertRaises(ValidationError) as context:
            training.full_clean()

        self.assertIn("Notes must be a dictionary.", str(context.exception))

    def test_training_notes_invalid_dict_contents(self):
        invalid_notes = {
            "description": "Great session",
            "score": 10  # integer instead of string
        }

        training = Training(
            owner=self.user,
            conducted=timezone.now(),
            notes=invalid_notes
        )

        with self.assertRaises(ValidationError) as context:
            training.full_clean()

        self.assertIn("Notes dictionary keys and values must be strings.", str(context.exception))

    def test_repr_method(self):
        training = Training.objects.create(
            owner=self.user,
            template=self.template,
            conducted=timezone.now(),
            title="Evening Workout",
            notes=self.valid_notes
        )

        expected_repr = (
            f"<Training(id={training.id}, title='Evening Workout', owner={self.user!r}, "
            f"conducted={training.conducted.isoformat()})>"
        )
        self.assertEqual(repr(training), expected_repr)

    def test_training_indexes(self):
        indexes = Training._meta.indexes
        index_fields = [tuple(index.fields) for index in indexes]

        expected_indexes = [
            ("-conducted",),
            ("owner", "-conducted"),
        ]

        for fields in expected_indexes:
            self.assertIn(fields, index_fields)


class TrainingTemplateModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="testuser@example.com",
            password="testpass123",
            first_name="Test",
            last_name="User"
        )

        self.valid_data = {
            "Notes": [
                {
                    "Name": "Description",
                    "field": "Text",
                    "Required": "False",
                    "Default": "",
                },
            ],
            "Exercises": [
                {
                    "Template": 235,
                    "Unit": {"Weight": "kg"},
                    "Sets": [
                        {"Reps": "7", "Weight": "42"},
                        {"Reps": "9", "Weight": "52"},
                    ],
                },
            ]
        }

        self.invalid_data_missing_unit = {
            "Exercises": [
                {
                    "Template": 235,
                    "Sets": [
                        {"Reps": "7", "Weight": "42"},  # Missing Unit for Weight
                    ],
                },
            ]
        }

        self.invalid_data_wrong_field = {
            "Notes": [
                {
                    "Name": "InvalidNote",
                    "field": "InvalidField",
                    "Required": "False",
                    "Default": "",
                },
            ],
        }

    def test_training_template_creation_valid(self):
        template = TrainingTemplate.objects.create(
            owner=self.user,
            name="Valid Template",
            description="A valid template description.",
            data=self.valid_data
        )

        self.assertEqual(template.name, "Valid Template")
        self.assertEqual(template.owner, self.user)
        self.assertEqual(template.data, self.valid_data)
        self.assertIsNotNone(template.created_at)

    def test_training_template_invalid_missing_unit(self):
        template = TrainingTemplate(
            owner=self.user,
            name="Invalid Missing Unit",
            data=self.invalid_data_missing_unit
        )

        with self.assertRaises(ValidationError) as context:
            template.full_clean()

        self.assertIn("must have unit", str(context.exception))

    def test_training_template_invalid_note_field(self):
        template = TrainingTemplate(
            owner=self.user,
            name="Invalid Note Field",
            data=self.invalid_data_wrong_field
        )

        with self.assertRaises(ValidationError) as context:
            template.full_clean()

        self.assertIn("Invalid field", str(context.exception))

    def test_training_template_optional_fields(self):
        minimal_data = {
            "Exercises": [{"Template": 100}]
        }

        template = TrainingTemplate(
            owner=self.user,
            name="Minimal Template",
            data=minimal_data
        )

        try:
            template.full_clean()  # Should not raise an error
        except ValidationError:
            self.fail("ValidationError raised unexpectedly for minimal valid data.")

    def test_str_and_repr(self):
        template = TrainingTemplate.objects.create(
            owner=self.user,
            name="Template String Test",
            data=self.valid_data
        )

        self.assertEqual(str(template), "Template String Test")
        expected_repr = f"Training template {template.pk} Template String Test of user {self.user}"
        self.assertEqual(repr(template), expected_repr)
