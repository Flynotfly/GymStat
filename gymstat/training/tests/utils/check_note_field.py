from unittest import TestCase

from django.core.exceptions import ValidationError

from ...utils import check_note_field


class TestCheckNoteField(TestCase):
    def do_test(self, field: str, value: str, expect: bool):
        if expect:
            self.assertTrue(check_note_field(field, value))
        else:
            with self.assertRaises(ValidationError):
                check_note_field(field, value)
    
    def test_text_field(self):
        self.do_test("Text", "test 2", True)

    def test_text_field_number(self):
        self.do_test("Text", "4214", True)

    def test_number_field_int(self):
        self.do_test("Number", "12", True)

    def test_number_field_float(self):
        self.do_test("Number", "13.204", True)

    def test_number_field_text(self):
        self.do_test("Number", "text", False)

    def test_number_field_time(self):
        self.do_test("Number", "2020-01-01 10:00:00", False)

    def test_5stars_field_5stars(self):
        self.do_test("5stars", "3", True)
    
    def test_5stars_field_too_small(self):
        self.do_test("5stars", "-2", False)
    
    def test_5stars_field_zero(self):
        self.do_test("5stars", "0", False)
    
    def test_5stars_field_too_big(self):
        self.do_test("5stars", "6", False)
    
    def test_5stars_field_float(self):
        self.do_test("5stars", "3.12", False)
    
    def test_5stars_field_text(self):
        self.do_test("5stars", "text", False)

    def test_10stars_field_10stars(self):
        self.do_test("10stars", "7", True)
    
    def test_10stars_field_too_small(self):
        self.do_test("10stars", "-2", False)
    
    def test_10stars_field_zero(self):
        self.do_test("10stars", "0", False)
    
    def test_10stars_field_too_big(self):
        self.do_test("10stars", "13", False)
    
    def test_10stars_field_float(self):
        self.do_test("10stars", "5.12", False)
    
    def test_10stars_field_text(self):
        self.do_test("10stars", "text", False)

    def test_datetime_field_datetime(self):
        self.do_test("Datetime", "2000-01-01 12:20:30", True)

    def test_datetime_field_wrong_style(self):
        self.do_test("Datetime", "2000/01/01 12:20:30", False)

    def test_datetime_field_wrong_time(self):
        self.do_test("Datetime", "2000-01-01 12:20:80", False)

    def test_datetime_field_only_time(self):
        self.do_test("Datetime", "12:20:30", False)

    def test_datetime_field_only_date(self):
        self.do_test("Datetime", "2000-01-01", False)

    def test_datetime_field_text(self):
        self.do_test("Datetime", "text", False)

    def test_duration_field_duration(self):
        self.do_test("Duration", "01:20:02", True)

    def test_duration_field_without_hour(self):
        self.do_test("Duration", "01:02", True)

    def test_duration_field_zero_minutes(self):
        self.do_test("Duration", "00:02", True)

    def test_duration_field_zero_time(self):
        self.do_test("Duration", "00:00", True)

    def test_duration_field_datetime(self):
        self.do_test("Duration", "2000-01-01 12:20:30", False)

    def test_duration_field_text(self):
        self.do_test("Duration", "text", False)

