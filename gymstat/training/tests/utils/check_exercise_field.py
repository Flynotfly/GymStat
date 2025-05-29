from ...utils import check_exercise_field
from django.core.exceptions import ValidationError
from unittest import TestCase


class CheckExerciseFieldTestCase(TestCase):
    def do_test(self, field: str, value: str, expect: bool):
        if expect:
            self.assertTrue(check_exercise_field(field, value))
        else:
            with self.assertRaises(ValidationError):
                check_exercise_field(field, value)

    def test_text_field(self):
        self.do_test("text", "test 2", True)

    def test_text_field_number(self):
        self.do_test("text", "4214", True)

    def test_int_field_int(self):
        self.do_test("int", "12", True)

    def test_int_field_float(self):
        self.do_test("int", "13.204", False)

    def test_int_field_text(self):
        self.do_test("int", "text", False)

    def test_int_field_time(self):
        self.do_test("int", "2020-01-01 10:00:00", False)

    def test_float_field_int(self):
        self.do_test("float", "12", True)

    def test_float_field_float(self):
        self.do_test("float", "13.204", True)

    def test_float_field_text(self):
        self.do_test("float", "text", False)

    def test_float_field_time(self):
        self.do_test("float", "2020-01-01 10:00:00", False)

    def test_duration_field_duration(self):
        self.do_test("duration", "01:20:02", True)

    def test_duration_field_without_hour(self):
        self.do_test("duration", "01:02", True)

    def test_duration_field_zero_minutes(self):
        self.do_test("duration", "00:02", True)

    def test_duration_field_zero_time(self):
        self.do_test("duration", "00:00", True)

    def test_duration_field_datetime(self):
        self.do_test("duration", "2000-01-01 12:20:30", False)

    def test_duration_field_text(self):
        self.do_test("duration", "text", False)
