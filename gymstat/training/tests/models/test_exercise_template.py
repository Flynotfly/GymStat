from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.test import TestCase

from user.tests import user_data

from ...models import ExerciseTemplate

User = get_user_model()


VALID_TAGS = ["chest", "core"]
INVALID_TAGS = ["chest", "monty"]
VALID_FIELDS = ["reps", "sets", "notes"]
INVALID_FIELDS = ["distance", "monty"]
name = "Test exercise"
description = "Exercise template description"


class ExerciseTemplateModelTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(**user_data)

    def test_success_create(self):
        template = ExerciseTemplate(
            name=name,
            owner=self.user,
            fields=VALID_FIELDS,
            tags=VALID_TAGS,
            description=description,
        )
        template.full_clean()
        template.save()
        self.assertEqual(ExerciseTemplate.objects.count(), 1)
        template = ExerciseTemplate.objects.first()
        self.assertEqual(template.name, name)
        self.assertEqual(template.owner, self.user)
        self.assertEqual(template.fields, VALID_FIELDS)
        self.assertEqual(template.tags, VALID_TAGS)
        self.assertEqual(template.description, description)
        self.assertTrue(template.is_active)
        self.assertFalse(template.is_admin)

    def test_name_too_long(self):
        template = ExerciseTemplate(
            name="a" * 51,
            owner=self.user,
            fields=VALID_FIELDS,
            tags=VALID_TAGS,
            description=description,
        )
        with self.assertRaises(ValidationError):
            template.full_clean()

    def test_name_is_empty(self):
        template = ExerciseTemplate(
            name="",
            owner=self.user,
            fields=VALID_FIELDS,
            tags=VALID_TAGS,
            description=description,
        )
        with self.assertRaises(ValidationError):
            template.full_clean()

    def test_no_description(self):
        template = ExerciseTemplate(
            name=name,
            owner=self.user,
            fields=VALID_FIELDS,
            tags=VALID_TAGS,
        )
        template.full_clean()
        template.save()
        self.assertEqual(ExerciseTemplate.objects.count(), 1)

    def test_no_owner(self):
        template = ExerciseTemplate(
            name=name,
            fields=VALID_FIELDS,
            tags=VALID_TAGS,
            description=description,
        )
        with self.assertRaises(ValidationError):
            template.full_clean()

    def test_no_tags(self):
        template = ExerciseTemplate(
            name=name,
            owner=self.user,
            fields=VALID_FIELDS,
            description=description,
        )
        template.full_clean()
        template.save()
        self.assertEqual(ExerciseTemplate.objects.count(), 1)

    def test_tags_are_empty(self):
        template = ExerciseTemplate(
            name=name,
            owner=self.user,
            fields=VALID_FIELDS,
            tags=[],
            description=description,
        )
        template.full_clean()
        template.save()
        self.assertEqual(ExerciseTemplate.objects.count(), 1)

    def test_invalid_tags(self):
        template = ExerciseTemplate(
            name=name,
            owner=self.user,
            fields=VALID_FIELDS,
            tags=INVALID_TAGS,
            description=description,
        )
        with self.assertRaises(ValidationError):
            template.full_clean()

    def test_no_fields(self):
        template = ExerciseTemplate(
            name=name,
            owner=self.user,
            tags=VALID_TAGS,
            description=description,
        )
        with self.assertRaises(ValidationError):
            template.full_clean()

    def test_fields_are_empty(self):
        template = ExerciseTemplate(
            name=name,
            owner=self.user,
            fields=[],
            tags=VALID_TAGS,
            description=description,
        )
        with self.assertRaises(ValidationError):
            template.full_clean()

    def test_fields_are_invalid(self):
        template = ExerciseTemplate(
            name=name,
            owner=self.user,
            fields=INVALID_FIELDS,
            tags=VALID_TAGS,
            description=description,
        )
        with self.assertRaises(ValidationError):
            template.full_clean()
