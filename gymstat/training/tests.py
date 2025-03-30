from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from .models import ExerciseTemplate

User = get_user_model()


class ExerciseTemplateModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='testuser@email.com', password='password123',
                                             first_name='Bob', last_name='Smith')

    def test_valid_fields(self):
        template = ExerciseTemplate(
            name="Valid Exercise Template",
            owner=self.user,
            fields=["Sets", "Reps", "Weight", "Tempo"],
            description="A valid template"
        )

        try:
            template.full_clean()  # should not raise an error
        except ValidationError:
            self.fail("template.full_clean() raised ValidationError unexpectedly!")

        template.save()
        self.assertEqual(ExerciseTemplate.objects.count(), 1)

    def test_invalid_field_name(self):
        template = ExerciseTemplate(
            name="Invalid Exercise Template",
            owner=self.user,
            fields=["InvalidField", "Sets"],
            description="This should fail due to invalid field"
        )

        with self.assertRaises(ValidationError) as context:
            template.full_clean()

        self.assertIn("Invalid fields provided", str(context.exception))

    def test_fields_as_non_list(self):
        template = ExerciseTemplate(
            name="Non-List Fields Template",
            owner=self.user,
            fields={"Sets": True},  # Passing a dict instead of a list
            description="This should fail due to incorrect data type"
        )

        with self.assertRaises(ValidationError) as context:
            template.full_clean()

        self.assertIn("Fields must be a list.", str(context.exception))

    def test_empty_fields_list(self):
        template = ExerciseTemplate(
            name="Empty Fields Template",
            owner=self.user,
            fields=[],  # An empty list should not be allowed
            description="This should fail because empty fields are not permitted"
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
            description="Duplicates should be allowed unless explicitly forbidden"
        )

        try:
            template.full_clean()  # duplicates are not explicitly disallowed
        except ValidationError:
            self.fail("template.full_clean() raised ValidationError unexpectedly for duplicate fields!")

        template.save()
        self.assertEqual(ExerciseTemplate.objects.count(), 1)