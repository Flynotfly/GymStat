from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db.utils import DataError

from user.tests import user_data

from ...models import ExerciseTemplate


User = get_user_model()


VALID_TAGS = ["chest", "core"]
INVALID_TAGS = ["chest", "monty"]
VALID_FIELDS = ["Reps", "Sets", "Notes"]
INVALID_FIELDS = ["Distance", "monty"]
name = "Test exercise"
description = "Exercise template description"


class ExerciseTemplateModelTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(**user_data)

    def test_success_create(self):
        ExerciseTemplate.objects.create(
            name=name,
            owner=self.user,
            fields=VALID_FIELDS,
            tags=VALID_TAGS,
            description=description,
        )
        self.assertEqual(ExerciseTemplate.objects.count(), 1)
        template = ExerciseTemplate.objects.first()
        self.assertEqual(template.name, name)
        self.assertEqual(template.owner, self.user)
        self.assertEqual(template.fields, VALID_FIELDS)
        self.assertEqual(template.tags, VALID_TAGS)
        self.assertEqual(template.description, description)
        self.assertTrue(template.is_active)
        self.assertFalse(template.is_admin)

    def test_empty_name(self):
        template = ExerciseTemplate(
                name="1234567890" * 6,
                owner=self.user,
                fields=VALID_FIELDS,
                tags=VALID_TAGS,
                description=description,
            )
        with self.assertRaises(ValidationError):
            template.full_clean()
