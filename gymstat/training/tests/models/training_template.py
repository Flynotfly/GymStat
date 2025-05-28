from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.test import TestCase

from user.tests import user_data

from ...models import TrainingTemplate

User = get_user_model()


NAME = "Test training template"
VALID_NOTES = [
    {
        "Name": "Text field",
        "Field": "Text",
        "Required": "True",
        "Default": "default text",
    },
    {
        "Name": "Second field",
        "Field": "Number",
        "Required": "False",
    },
]
VALID_EXERCISES = [
    {
        "Template": "4",
        "Sets": [
            {
                "reps": "3",
                "attempts": "5",
            },
            {
                "reps": "10",
                "successes": "5",
            },
            {
                "reps": "3",
                "attempts": "5",
                "notes": "This is notes for exercise",
            },
        ],
    },
    {
        "Template": "12",
        "Unit": {
            "weight": "kg",
            "speed": "mps",
        },
        "Sets": [
            {
                "reps": "12",
                "weight": "4",
            },
            {
                "weight": "110.12",
                "speed": "51",
            },
        ],
    },
]
VALID_DATA = {
    "Notes": VALID_NOTES,
    "Exercises": VALID_EXERCISES,
}


class TrainingTemplateModelTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(**user_data)

    # Basic create
    def test_success_create(self):
        template = TrainingTemplate(
            name=NAME,
            owner=self.user,
            data=VALID_DATA,
        )
        template.full_clean()
        template.save()
        self.assertEqual(TrainingTemplate.objects.count(), 1)
        template = TrainingTemplate.objects.first()
        self.assertEqual(template.name, NAME)
        self.assertEqual(template.owner, self.user)
        self.assertEqual(template.data, VALID_DATA)
        self.assertEqual(template.description, None)

    def test_create_with_description(self):
        description = "This is descrription of template"
        template = TrainingTemplate(
            name=NAME,
            owner=self.user,
            data=VALID_DATA,
            description=description,
        )
        template.full_clean()
        template.save()
        self.assertEqual(TrainingTemplate.objects.count(), 1)
        template = TrainingTemplate.objects.first()
        self.assertEqual(template.name, NAME)
        self.assertEqual(template.owner, self.user)
        self.assertEqual(template.data, VALID_DATA)
        self.assertEqual(template.description, description)

    # Wrong name
    def test_no_name(self):
        template = TrainingTemplate(
            name="",
            owner=self.user,
            data=VALID_DATA,
        )
        with self.assertRaises(ValidationError):
            template.full_clean()

    def test_name_too_long(self):
        template = TrainingTemplate(
            name="a" * 71,
            owner=self.user,
            data=VALID_DATA,
        )
        with self.assertRaises(ValidationError):
            template.full_clean()

    # Partial data
    def test_no_data(self):
        template = TrainingTemplate(
            name=NAME,
            owner=self.user,
        )
        with self.assertRaises(ValidationError):
            template.full_clean()

    def test_empty_data(self):
        template = TrainingTemplate(
            name=NAME,
            owner=self.user,
            data={},
        )
        template.full_clean()
        template.save()
        self.assertEqual(TrainingTemplate.objects.count(), 1)

    def test_no_exercises(self):
        template = TrainingTemplate(
            name=NAME,
            owner=self.user,
            data={"Notes": VALID_NOTES},
        )
        template.full_clean()
        template.save()

        self.assertEqual(TrainingTemplate.objects.count(), 1)

    def test_no_notes(self):
        template = TrainingTemplate(
            name=NAME,
            owner=self.user,
            data={"Exercises": VALID_EXERCISES},
        )
        template.full_clean()
        template.save()
        self.assertEqual(TrainingTemplate.objects.count(), 1)

    # Test notes
    def test_one_note_without_list(self):
        template = TrainingTemplate(
            name=NAME,
            owner=self.user,
            data={
                "Notes": {
                    "Name": "Text field",
                    "Field": "Text",
                    "Required": "True",
                    "Default": "default text",
                }
            },
        )
        with self.assertRaises(ValidationError):
            template.full_clean()

    def test_notes_without_name(self):
        template = TrainingTemplate(
            name=NAME,
            owner=self.user,
            data={
                "Notes": [
                    {
                        "Field": "Text",
                        "Required": "True",
                        "Default": "default text",
                    }
                ]
            },
        )
        with self.assertRaises(ValidationError):
            template.full_clean()

    def test_notes_with_empty_name(self):
        template = TrainingTemplate(
            name=NAME,
            owner=self.user,
            data={
                "Notes": [
                    {
                        "Name": "",
                        "Field": "Text",
                        "Required": "True",
                        "Default": "default text",
                    }
                ]
            },
        )
        with self.assertRaises(ValidationError):
            template.full_clean()

    def test_notes_without_field(self):
        template = TrainingTemplate(
            name=NAME,
            owner=self.user,
            data={
                "Notes": [
                    {
                        "Name": "Text field",
                        "Required": "True",
                        "Default": "default text",
                    }
                ]
            },
        )
        with self.assertRaises(ValidationError):
            template.full_clean()

    def test_notes_with_empty_field(self):
        template = TrainingTemplate(
            name=NAME,
            owner=self.user,
            data={
                "Notes": [
                    {
                        "Name": "Text field",
                        "Field": "",
                        "Required": "True",
                        "Default": "default text",
                    }
                ]
            },
        )
        with self.assertRaises(ValidationError):
            template.full_clean()

    def test_notes_with_wrong_field(self):
        template = TrainingTemplate(
            name=NAME,
            owner=self.user,
            data={
                "Notes": [
                    {
                        "Name": "Text field",
                        "Field": "Wrong",
                        "Required": "True",
                        "Default": "default text",
                    }
                ]
            },
        )
        with self.assertRaises(ValidationError):
            template.full_clean()

    def test_notes_with_different_field(self):
        template = TrainingTemplate(
            name=NAME,
            owner=self.user,
            data={
                "Notes": [
                    {
                        "Name": "Text field",
                        "Field": "5stars",
                        "Required": "True",
                        "Default": "5",
                    }
                ]
            },
        )
        template.full_clean()
        template.save()
        self.assertEqual(TrainingTemplate.objects.count(), 1)

    def test_notes_without_required(self):
        template = TrainingTemplate(
            name=NAME,
            owner=self.user,
            data={
                "Notes": [
                    {
                        "Name": "Text field",
                        "Field": "Text",
                        "Default": "default text",
                    }
                ]
            },
        )
        with self.assertRaises(ValidationError):
            template.full_clean()

    def test_notes_with_required_is_false(self):
        template = TrainingTemplate(
            name=NAME,
            owner=self.user,
            data={
                "Notes": [
                    {
                        "Name": "Text field",
                        "Field": "Text",
                        "Required": "False",
                        "Default": "default text",
                    }
                ]
            },
        )
        template.full_clean()
        template.save()
        self.assertEqual(TrainingTemplate.objects.count(), 1)

    def test_notes_with_wrong_required(self):
        template = TrainingTemplate(
            name=NAME,
            owner=self.user,
            data={
                "Notes": [
                    {
                        "Name": "Text field",
                        "Field": "Text",
                        "Required": "Wrong",
                        "Default": "default text",
                    }
                ]
            },
        )
        with self.assertRaises(ValidationError):
            template.full_clean()

    # Test notes default
    def test_notes_without_default(self):
        template = TrainingTemplate(
            name=NAME,
            owner=self.user,
            data={
                "Notes": [
                    {
                        "Name": "Text field",
                        "Field": "Text",
                        "Required": "True",
                    }
                ]
            },
        )
        template.full_clean()
        template.save()
        self.assertEqual(TrainingTemplate.objects.count(), 1)

    def test_notes_number_default_success(self):
        template = TrainingTemplate(
            name=NAME,
            owner=self.user,
            data={
                "Notes": [
                    {
                        "Name": "Text field",
                        "Field": "Number",
                        "Required": "True",
                        "Default": "12.1",
                    }
                ]
            },
        )
        template.full_clean()
        template.save()
        self.assertEqual(TrainingTemplate.objects.count(), 1)

    def test_notes_number_default_fail(self):
        template = TrainingTemplate(
            name=NAME,
            owner=self.user,
            data={
                "Notes": [
                    {
                        "Name": "Text field",
                        "Field": "Number",
                        "Required": "True",
                        "Default": "default text",
                    }
                ]
            },
        )
        with self.assertRaises(ValidationError):
            template.full_clean()

    def test_notes_duration_hours_default_success(self):
        template = TrainingTemplate(
            name=NAME,
            owner=self.user,
            data={
                "Notes": [
                    {
                        "Name": "Text field",
                        "Field": "Duration",
                        "Required": "True",
                        "Default": "12:10:2",
                    }
                ]
            },
        )
        template.full_clean()
        template.save()
        self.assertEqual(TrainingTemplate.objects.count(), 1)

    def test_notes_duration_minutes_default_success(self):
        template = TrainingTemplate(
            name=NAME,
            owner=self.user,
            data={
                "Notes": [
                    {
                        "Name": "Text field",
                        "Field": "Duration",
                        "Required": "True",
                        "Default": "12:00",
                    }
                ]
            },
        )
        template.full_clean()
        template.save()
        self.assertEqual(TrainingTemplate.objects.count(), 1)

    def test_notes_duration_default_fail(self):
        template = TrainingTemplate(
            name=NAME,
            owner=self.user,
            data={
                "Notes": [
                    {
                        "Name": "Text field",
                        "Field": "Duration",
                        "Required": "True",
                        "Default": "10:23:12:2",
                    }
                ]
            },
        )
        with self.assertRaises(ValidationError):
            template.full_clean()

    def test_notes_datetime_default_success(self):
        template = TrainingTemplate(
            name=NAME,
            owner=self.user,
            data={
                "Notes": [
                    {
                        "Name": "Text field",
                        "Field": "Datetime",
                        "Required": "True",
                        "Default": "2020-1-20 0:0:0",
                    }
                ]
            },
        )
        template.full_clean()
        template.save()
        self.assertEqual(TrainingTemplate.objects.count(), 1)

    def test_notes_datetime_default_fail(self):
        template = TrainingTemplate(
            name=NAME,
            owner=self.user,
            data={
                "Notes": [
                    {
                        "Name": "Text field",
                        "Field": "Datetime",
                        "Required": "True",
                        "Default": "2004-12-1",
                    }
                ]
            },
        )
        with self.assertRaises(ValidationError):
            template.full_clean()

    # --- Exercises validation tests ---
    def test_exercises_not_list(self):
        template = TrainingTemplate(
            name=NAME,
            owner=self.user,
            data={"Exercises": {"Template": "1"}},
        )
        with self.assertRaises(ValidationError):
            template.full_clean()

    def test_exercise_element_not_dict(self):
        template = TrainingTemplate(
            name=NAME,
            owner=self.user,
            data={"Exercises": ["not a dict"]},
        )
        with self.assertRaises(ValidationError):
            template.full_clean()

    def test_exercise_missing_template(self):
        template = TrainingTemplate(
            name=NAME,
            owner=self.user,
            data={"Exercises": [{"Sets": []}]},
        )
        with self.assertRaises(ValidationError):
            template.full_clean()

    def test_exercise_template_not_int_string(self):
        template = TrainingTemplate(
            name=NAME,
            owner=self.user,
            data={"Exercises": [{"Template": "abc"}]},
        )
        with self.assertRaises(ValidationError):
            template.full_clean()

    def test_set_element_not_dict(self):
        template = TrainingTemplate(
            name=NAME,
            owner=self.user,
            data={"Exercises": [{"Template": "1", "Sets": ["oops"]}]},
        )
        with self.assertRaises(ValidationError):
            template.full_clean()

    def test_set_empty_dict(self):
        template = TrainingTemplate(
            name=NAME,
            owner=self.user,
            data={"Exercises": [{"Template": "1", "Sets": [{}]}]},
        )
        with self.assertRaises(ValidationError):
            template.full_clean()

    def test_set_field_not_allowed(self):
        template = TrainingTemplate(
            name=NAME,
            owner=self.user,
            data={"Exercises": [{"Template": "1", "Sets": [{"foo": "123"}]}]},
        )
        with self.assertRaises(ValidationError):
            template.full_clean()

    def test_set_int_field_invalid_value(self):
        template = TrainingTemplate(
            name=NAME,
            owner=self.user,
            data={
                "Exercises": [
                    {"Template": "1", "Sets": [{"reps": "not-an-int"}]}
                ]
            },
        )
        with self.assertRaises(ValidationError):
            template.full_clean()

    def test_set_float_field_invalid_value(self):
        template = TrainingTemplate(
            name=NAME,
            owner=self.user,
            data={
                "Exercises": [
                    {"Template": "1", "Sets": [{"weight": "not-a-float"}]}
                ]
            },
        )
        with self.assertRaises(ValidationError):
            template.full_clean()

    def test_set_duration_field_wrong_type(self):
        template = TrainingTemplate(
            name=NAME,
            owner=self.user,
            data={
                "Exercises": [{"Template": "1", "Sets": [{"rest": "12:00"}]}]
            },
        )
        with self.assertRaises(ValidationError):
            template.full_clean()

    def test_unit_missing_allowed_unit(self):
        template = TrainingTemplate(
            name=NAME,
            owner=self.user,
            data={
                "Exercises": [
                    {
                        "Template": "1",
                        "Unit": {"weight": "no"},
                        "Sets": [{"weight": "10"}],
                    }
                ]
            },
        )
        with self.assertRaises(ValidationError):
            template.full_clean()

    def test_no_unit(self):
        template = TrainingTemplate(
            name=NAME,
            owner=self.user,
            data={
                "Exercises": [{"Template": "1", "Sets": [{"weight": "10"}]}]
            },
        )
        with self.assertRaises(ValidationError):
            template.full_clean()

    # --- Exercises validation tests ---
    def test_exercises_not_list(self):
        template = TrainingTemplate(
            name=NAME,
            owner=self.user,
            data={"Exercises": {"Template": "1"}},
        )
        with self.assertRaises(ValidationError):
            template.full_clean()

    def test_exercise_element_not_dict(self):
        template = TrainingTemplate(
            name=NAME,
            owner=self.user,
            data={"Exercises": ["not a dict"]},
        )
        with self.assertRaises(ValidationError):
            template.full_clean()

    def test_exercise_missing_template(self):
        template = TrainingTemplate(
            name=NAME,
            owner=self.user,
            data={"Exercises": [{"Sets": []}]},
        )
        with self.assertRaises(ValidationError):
            template.full_clean()

    def test_exercise_template_not_int_string(self):
        template = TrainingTemplate(
            name=NAME,
            owner=self.user,
            data={"Exercises": [{"Template": "abc"}]},
        )
        with self.assertRaises(ValidationError):
            template.full_clean()

    def test_set_element_not_dict(self):
        template = TrainingTemplate(
            name=NAME,
            owner=self.user,
            data={"Exercises": [{"Template": "1", "Sets": ["oops"]}]},
        )
        with self.assertRaises(ValidationError):
            template.full_clean()

    def test_set_empty_dict(self):
        template = TrainingTemplate(
            name=NAME,
            owner=self.user,
            data={"Exercises": [{"Template": "1", "Sets": [{}]}]},
        )
        with self.assertRaises(ValidationError):
            template.full_clean()

    def test_set_field_not_allowed(self):
        template = TrainingTemplate(
            name=NAME,
            owner=self.user,
            data={
                "Exercises": [{
                    "Template": "1",
                    "Sets": [{"foo": "123"}]
                }]
            },
        )
        with self.assertRaises(ValidationError):
            template.full_clean()

    def test_set_int_field_invalid_value(self):
        template = TrainingTemplate(
            name=NAME,
            owner=self.user,
            data={
                "Exercises": [{
                    "Template": "1",
                    "Sets": [{"reps": "not-an-int"}]
                }]
            },
        )
        with self.assertRaises(ValidationError):
            template.full_clean()

    def test_set_float_field_invalid_value(self):
        template = TrainingTemplate(
            name=NAME,
            owner=self.user,
            data={
                "Exercises": [{
                    "Template": "1",
                    "Sets": [{"weight": "not-a-float"}]
                }]
            },
        )
        with self.assertRaises(ValidationError):
            template.full_clean()

    def test_set_duration_field_wrong_type(self):
        template = TrainingTemplate(
            name=NAME,
            owner=self.user,
            data={
                "Exercises": [{
                    "Template": "1",
                    "Sets": [{"rest": "yes"}]
                }]
            },
        )
        with self.assertRaises(ValidationError):
            template.full_clean()

    def test_unit_missing_allowed_unit(self):
        template = TrainingTemplate(
            name=NAME,
            owner=self.user,
            data={
                "Exercises": [{
                    "Template": "1",
                    "Unit": {"weight": "no"},
                    "Sets": [{"weight": "10"}]
                }]
            },
        )
        with self.assertRaises(ValidationError):
            template.full_clean()

    def test_no_unit(self):
        template = TrainingTemplate(
            name=NAME,
            owner=self.user,
            data={
                "Exercises": [{
                    "Template": "1",
                    "Sets": [{"weight": "10"}]
                }]
            },
        )
        with self.assertRaises(ValidationError):
            template.full_clean()
