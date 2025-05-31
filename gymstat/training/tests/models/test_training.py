import datetime
import zoneinfo

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError, PermissionDenied
from django.test import TestCase

from training.constants import NOTES_FIELDS
from user.tests import other_user_data, user_data

from ...models import Exercise, ExerciseTemplate, Training, TrainingTemplate

User = get_user_model()


berlin_tz = zoneinfo.ZoneInfo("Europe/Berlin")
VALID_CONDUCTED = datetime.datetime(2025, 4, 1, 12, 40, 30, tzinfo=berlin_tz)
VALID_TITLE = "Valid title for training"
VALID_NOTES = [
    {
        "Name": "Text field",
        "Field": "Text",
        "Required": "True",
        "Value": "I wrote this te",
    },
    {
        "Name": "Number field",
        "Field": "Number",
        "Required": "False",
        "Value": "12",
    },
    {
        "Name": "Not mandatory field",
        "Field": "10stars",
        "Required": "False",
        "Value": "",
    },
]


class TrainingModelTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(**user_data)
        self.other_user = User.objects.create_user(**other_user_data)

        self.template = TrainingTemplate.objects.create(
            name="Training template",
            owner=self.user,
        )
        self.second_training_template = TrainingTemplate.objects.create(
            name="Second training template",
            owner=self.user,
        )
        self.other_user_template = TrainingTemplate.objects.create(
            name="Other user template",
            owner=self.other_user,
        )

        self.exercise_template = ExerciseTemplate.objects.create(
            name="Bench press", owner=self.user, fields=["reps", "weight"]
        )
        self.admin_exercise_template = ExerciseTemplate.objects.create(
            name="Core training",
            owner=self.other_user,
            fields=["reps", "rest"],
            is_admin=True,
        )
        self.other_user_exercise_template = ExerciseTemplate.objects.create(
            name="Legs",
            owner=self.other_user,
            fields=["sets"],
        )

        self.first_exercise_data = {
            "Template": self.exercise_template,
            "Order": 1,
            "Units": {"weight": "kg"},
            "Sets": [
                {
                    "reps": "7",
                    "weight": "45",
                },
                {
                    "reps": "4",
                    "weight": "60",
                },
                {
                    "reps": "8",
                    "weight": "70",
                },
            ],
        }
        self.second_exercise_data = {
            "Template": self.admin_exercise_template,
            "Order": 2,
        }
        self.unaccessible_exercise_data = {
            "Template": self.other_user_exercise_template,
            "Order": 3,
        }

    # --- General ---
    def test_success_create(self):
        description = "This is valid description"
        Training.objects.create_training(
            owner=self.user,
            template=self.template,
            conducted=VALID_CONDUCTED,
            title=VALID_TITLE,
            description=description,
            notes=VALID_NOTES,
            exercises_data=[
                self.first_exercise_data,
                self.second_exercise_data,
            ],
        )
        self.assertEqual(Training.objects.count(), 1)
        self.assertEqual(Exercise.objects.count(), 2)
        training = Training.objects.first()
        self.assertEqual(training.owner, self.user)
        self.assertEqual(training.template, self.template)
        self.assertEqual(training.conducted, VALID_CONDUCTED)
        self.assertEqual(training.title, VALID_TITLE)
        self.assertEqual(training.description, description)
        self.assertEqual(training.notes, VALID_NOTES)
        first_exercise, second_exercise = Exercise.objects.all()
        self.assertEqual(first_exercise.training, training)
        self.assertEqual(first_exercise.template, self.exercise_template)
        self.assertEqual(first_exercise.order, 1)
        self.assertEqual(
            first_exercise.units, self.first_exercise_data["Units"]
        )
        self.assertEqual(first_exercise.sets, self.first_exercise_data["Sets"])
        self.assertEqual(second_exercise.training, training)
        self.assertEqual(
            second_exercise.template, self.admin_exercise_template
        )
        self.assertEqual(second_exercise.order, 2)
        self.assertEqual(second_exercise.units, None)
        self.assertEqual(second_exercise.sets, None)

    def test_create_training_no_title(self):
        description = "This is valid description"
        Training.objects.create_training(
            owner=self.user,
            template=self.template,
            conducted=VALID_CONDUCTED,
            description=description,
            notes=VALID_NOTES,
            exercises_data=[
                self.first_exercise_data,
                self.second_exercise_data,
            ],
        )
        self.assertEqual(Training.objects.count(), 1)
        self.assertEqual(Exercise.objects.count(), 2)

    def test_create_training_title_too_long(self):
        description = "This is valid description"
        with self.assertRaises(ValidationError):
            Training.objects.create_training(
                owner=self.user,
                template=self.template,
                conducted=VALID_CONDUCTED,
                title="a" * 75,
                description=description,
                notes=VALID_NOTES,
                exercises_data=[
                    self.first_exercise_data,
                    self.second_exercise_data,
                ],
            )

    def test_create_training_no_description(self):
        Training.objects.create_training(
            owner=self.user,
            template=self.template,
            conducted=VALID_CONDUCTED,
            title=VALID_TITLE,
            notes=VALID_NOTES,
            exercises_data=[
                self.first_exercise_data,
                self.second_exercise_data,
            ],
        )
        self.assertEqual(Training.objects.count(), 1)
        self.assertEqual(Exercise.objects.count(), 2)

    def test_create_training_wrong_template(self):
        with self.assertRaises(PermissionDenied):
            description = "This is valid description"
            Training.objects.create_training(
                owner=self.user,
                template=self.other_user_template,
                conducted=VALID_CONDUCTED,
                title=VALID_TITLE,
                description=description,
                notes=VALID_NOTES,
                exercises_data=[
                    self.first_exercise_data,
                    self.second_exercise_data,
                ],
            )

    def test_create_training_no_template(self):
        Training.objects.create_training(
            owner=self.user,
            conducted=VALID_CONDUCTED,
            title=VALID_TITLE,
            notes=VALID_NOTES,
            exercises_data=[
                self.first_exercise_data,
                self.second_exercise_data,
            ],
        )
        self.assertEqual(Training.objects.count(), 1)
        self.assertEqual(Exercise.objects.count(), 2)

    # --- Notes ---
    def test_create_training_no_notes(self):
        Training.objects.create_training(
            owner=self.user,
            template=self.template,
            conducted=VALID_CONDUCTED,
            title=VALID_TITLE,
            exercises_data=[
                self.first_exercise_data,
                self.second_exercise_data,
            ],
        )
        self.assertEqual(Training.objects.count(), 1)
        self.assertEqual(Exercise.objects.count(), 2)

    def test_create_training_non_list_notes(self):
        with self.assertRaises(ValidationError):
            Training.objects.create_training(
                owner=self.user,
                template=self.template,
                conducted=VALID_CONDUCTED,
                title=VALID_TITLE,
                notes={
                    "Name": "Text field",
                    "Field": "Text",
                    "Required": "True",
                    "Value": "I wrote this text",
                },
                exercises_data=[
                    self.first_exercise_data,
                    self.second_exercise_data,
                ],
            )

    def test_create_training_single_note(self):
        Training.objects.create_training(
            owner=self.user,
            template=self.template,
            conducted=VALID_CONDUCTED,
            title=VALID_TITLE,
            notes=[
                {
                    "Name": "Text field",
                    "Field": "Text",
                    "Required": "True",
                    "Value": "I wrote this te",
                },
            ],
            exercises_data=[
                self.first_exercise_data,
                self.second_exercise_data,
            ],
        )
        self.assertEqual(Training.objects.count(), 1)
        self.assertEqual(Exercise.objects.count(), 2)

    def test_create_training_with_wrong_notes_fields(self):
        notes = [
            {
                "Field": "Text",
                "Required": "True",
                "Value": "I wrote this te",
            },
            {
                "Name": "Text field",
                "Required": "True",
                "Value": "I wrote this te",
            },
            {
                "Name": "Text field",
                "Field": "Text",
                "Value": "I wrote this te",
            },
            {
                "Name": "Text field",
                "Field": "Text",
                "Required": "False",
            },
            {
                "Name": "Text field",
                "Field": "Text",
                "Required": "True",
                "Value": "I wrote this te",
                "Wrong": "Yes",
            },
        ]
        for note in notes:
            with self.assertRaises(ValidationError):
                Training.objects.create_training(
                    owner=self.user,
                    template=self.template,
                    conducted=VALID_CONDUCTED,
                    title=VALID_TITLE,
                    notes=[note],
                    exercises_data=[
                        self.first_exercise_data,
                        self.second_exercise_data,
                    ],
                )

    def test_create_training_empty_note_name(self):
        with self.assertRaises(ValidationError):
            Training.objects.create_training(
                owner=self.user,
                template=self.template,
                conducted=VALID_CONDUCTED,
                title=VALID_TITLE,
                notes=[
                    {
                        "Name": "",
                        "Field": "Text",
                        "Required": "True",
                        "Value": "I wrote this te",
                    },
                ],
                exercises_data=[
                    self.first_exercise_data,
                    self.second_exercise_data,
                ],
            )

    def test_create_training_note_fields(self):
        for field in NOTES_FIELDS:
            Training.objects.create_training(
                owner=self.user,
                template=self.template,
                conducted=VALID_CONDUCTED,
                title=VALID_TITLE,
                notes=[
                    {
                        "Name": "Text field",
                        "Field": field,
                        "Required": "False",
                        "Value": "",
                    },
                ],
                exercises_data=[
                    self.first_exercise_data,
                    self.second_exercise_data,
                ],
            )
        self.assertEqual(Training.objects.count(), len(NOTES_FIELDS))
        self.assertEqual(Exercise.objects.count(), len(NOTES_FIELDS) * 2)

    def test_create_training_wrong_note_field(self):
        with self.assertRaises(ValidationError):
            Training.objects.create_training(
                owner=self.user,
                template=self.template,
                conducted=VALID_CONDUCTED,
                title=VALID_TITLE,
                notes=[
                    {
                        "Name": "Title",
                        "Field": "Wrong",
                        "Required": "True",
                        "Value": "I wrote this te",
                    },
                ],
                exercises_data=[
                    self.first_exercise_data,
                    self.second_exercise_data,
                ],
            )

    def test_create_training_notes_required_is_false(self):
        Training.objects.create_training(
            owner=self.user,
            template=self.template,
            conducted=VALID_CONDUCTED,
            title=VALID_TITLE,
            notes=[
                {
                    "Name": "Text field",
                    "Field": "Text",
                    "Required": "False",
                    "Value": "I wrote this te",
                },
            ],
            exercises_data=[
                self.first_exercise_data,
                self.second_exercise_data,
            ],
        )
        self.assertEqual(Training.objects.count(), 1)
        self.assertEqual(Exercise.objects.count(), 2)

    def test_create_training_notes_required_but_empty(self):
        with self.assertRaises(ValidationError):
            Training.objects.create_training(
                owner=self.user,
                template=self.template,
                conducted=VALID_CONDUCTED,
                title=VALID_TITLE,
                notes=[
                    {
                        "Name": "Text field",
                        "Field": "Text",
                        "Required": "True",
                        "Value": "",
                    },
                ],
                exercises_data=[
                    self.first_exercise_data,
                    self.second_exercise_data,
                ],
            )

    def test_create_training_wrong_required(self):
        with self.assertRaises(ValidationError):
            Training.objects.create_training(
                owner=self.user,
                template=self.template,
                conducted=VALID_CONDUCTED,
                title=VALID_TITLE,
                notes=[
                    {
                        "Name": "Text field",
                        "Field": "Text",
                        "Required": "Wrong",
                        "Value": "I wrote this te",
                    },
                ],
                exercises_data=[
                    self.first_exercise_data,
                    self.second_exercise_data,
                ],
            )

    # --- Exercises ---
    def test_create_training_no_exercises(self):
        Training.objects.create_training(
            owner=self.user,
            template=self.template,
            conducted=VALID_CONDUCTED,
            title=VALID_TITLE,
            notes=VALID_NOTES,
        )
        self.assertEqual(Training.objects.count(), 1)
        self.assertEqual(Exercise.objects.count(), 0)

    def test_create_training_unnaccessible_exercise(self):
        with self.assertRaises(PermissionDenied):
            Training.objects.create_training(
                owner=self.user,
                template=self.template,
                conducted=VALID_CONDUCTED,
                title=VALID_TITLE,
                notes=VALID_NOTES,
                exercises_data=[
                    self.first_exercise_data,
                    self.second_exercise_data,
                    self.unaccessible_exercise_data,
                ],
            )

    def test_create_training_exercise_non_list(self):
        with self.assertRaises(ValidationError):
            Training.objects.create_training(
                owner=self.user,
                template=self.template,
                conducted=VALID_CONDUCTED,
                title=VALID_TITLE,
                notes=VALID_NOTES,
                exercises_data=self.first_exercise_data,
            )

    def test_create_training_two_exercises_with_same_order(self):
        with self.assertRaises(ValidationError):
            Training.objects.create_training(
                owner=self.user,
                template=self.template,
                conducted=VALID_CONDUCTED,
                title=VALID_TITLE,
                notes=VALID_NOTES,
                exercises_data=[
                    self.second_exercise_data,
                    self.second_exercise_data,
                ],
            )

    def test_create_training_no_order(self):
        with self.assertRaises(ValidationError):
            Training.objects.create_training(
                owner=self.user,
                template=self.template,
                conducted=VALID_CONDUCTED,
                title=VALID_TITLE,
                notes=VALID_NOTES,
                exercises_data=[
                    {
                        "Template": self.admin_exercise_template,
                    }
                ],
            )

    def test_create_training_zero_order(self):
        with self.assertRaises(ValidationError):
            Training.objects.create_training(
                owner=self.user,
                template=self.template,
                conducted=VALID_CONDUCTED,
                title=VALID_TITLE,
                notes=VALID_NOTES,
                exercises_data=[
                    {
                        "Template": self.admin_exercise_template,
                        "Order": 0,
                    }
                ],
            )

    def test_create_training_negative_order(self):
        with self.assertRaises(ValidationError):
            Training.objects.create_training(
                owner=self.user,
                template=self.template,
                conducted=VALID_CONDUCTED,
                title=VALID_TITLE,
                notes=VALID_NOTES,
                exercises_data=[
                    {
                        "Template": self.admin_exercise_template,
                        "Order": -1,
                    }
                ],
            )

    def test_create_training_non_first(self):
        with self.assertRaises(ValidationError):
            Training.objects.create_training(
                owner=self.user,
                template=self.template,
                conducted=VALID_CONDUCTED,
                title=VALID_TITLE,
                notes=VALID_NOTES,
                exercises_data=[
                    {
                        "Template": self.admin_exercise_template,
                        "Order": 2,
                    }
                ],
            )

    def test_create_training_no_unit_success(self):
        Training.objects.create_training(
            owner=self.user,
            template=self.template,
            conducted=VALID_CONDUCTED,
            title=VALID_TITLE,
            notes=VALID_NOTES,
            exercises_data=[
                {
                    "Template": self.admin_exercise_template,
                    "Order": 1,
                    "Sets": [
                        {
                            "reps": "3",
                            "rest": "10:00",
                        }
                    ],
                }
            ],
        )
        self.assertEqual(Training.objects.count(), 1)
        self.assertEqual(Exercise.objects.count(), 1)

    def test_create_training_no_unit_fail(self):
        with self.assertRaises(ValidationError):
            Training.objects.create_training(
                owner=self.user,
                template=self.template,
                conducted=VALID_CONDUCTED,
                title=VALID_TITLE,
                notes=VALID_NOTES,
                exercises_data=[
                    {
                        "Template": self.exercise_template,
                        "Order": 2,
                        "Sets": [
                            {
                                "reps": "3",
                                "weight": "100",
                            }
                        ],
                    }
                ],
            )

    # --- Update training ---
    def test_update_training(self):
        description = "This is valid description"
        Training.objects.create_training(
            owner=self.user,
            template=self.template,
            conducted=VALID_CONDUCTED,
            title=VALID_TITLE,
            description=description,
            notes=VALID_NOTES,
            exercises_data=[
                self.first_exercise_data,
                self.second_exercise_data,
            ],
        )
        self.assertEqual(Training.objects.count(), 1)
        self.assertEqual(Exercise.objects.count(), 2)
        training = Training.objects.first()
        conducted = datetime.datetime(2025, 5, 2, 20, 40, 30, tzinfo=berlin_tz)
        title = "New title"
        description = "Brand new description"
        notes = [
            {
                "Name": "Rate",
                "Field": "5stars",
                "Required": "True",
                "Value": "3",
            },
            {
                "Name": "Duration field in notes",
                "Field": "Duration",
                "Required": "False",
                "Value": "",
            },
        ]
        exercise_template = ExerciseTemplate.objects.create(
            name="Leg press",
            owner=self.user,
            fields=["reps", "weight", "rest"],
        )
        first_exercise_data = {
            "Template": self.admin_exercise_template,
            "Order": 1,
        }
        second_exercise_data = {
            "Template": exercise_template,
            "Order": 2,
            "Units": {"weight": "lbs"},
            "Sets": [
                {"reps": "10", "weight": "80", "rest": "20:00"},
                {
                    "reps": "4",
                    "weight": "60",
                },
                {
                    "reps": "8",
                    "weight": "70",
                },
            ],
        }
        Training.objects.update_training(
            training=training,
            owner=self.user,
            template=self.second_training_template,
            conducted=conducted,
            title=title,
            description=description,
            notes=notes,
            exercises_data=[
                first_exercise_data,
                second_exercise_data,
            ],
        )
        self.assertEqual(Training.objects.count(), 1)
        self.assertEqual(Exercise.objects.count(), 2)
        training.refresh_from_db()
        self.assertEqual(training.owner, self.user)
        self.assertEqual(training.template, self.second_training_template)
        self.assertEqual(training.conducted, conducted)
        self.assertEqual(training.title, title)
        self.assertEqual(training.description, description)
        self.assertEqual(training.notes, notes)
        exercises = Exercise.objects.filter(training=training)
        self.assertEqual(exercises.count(), 2)
        first_exercise, second_exercise = exercises
        self.assertEqual(first_exercise.training, training)
        self.assertEqual(
            first_exercise.template, first_exercise_data["Template"]
        )
        self.assertEqual(first_exercise.order, 1)
        self.assertEqual(first_exercise.units, None)
        self.assertEqual(first_exercise.sets, None)
        self.assertEqual(second_exercise.training, training)
        self.assertEqual(second_exercise.template, second_exercise_data["Template"])
        self.assertEqual(second_exercise.order, 2)
        self.assertEqual(second_exercise.units, second_exercise_data["Units"])
        self.assertEqual(second_exercise.sets, second_exercise_data["Sets"])
