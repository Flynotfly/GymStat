from datetime import datetime
from typing import Literal

from django.core.exceptions import ValidationError


def check_note_field(field: str, value: str) -> Literal[True]:
    match field:
        case "Text":
            return True
        case "Number":
            try:
                float(value)
            except ValueError:
                raise ValidationError(f"Value '{value}' do not match type '{field}'")
            else:
                return True
        case "Datetime":
            try:
                datetime.strptime(value, "%Y-%m-%d %H:%M:%S")
            except ValueError:
                raise ValidationError(f"Value '{value}' do not match type '{field}'")
            else:
                return True
        case "Duration":
            for fmt in ("%H:%M:%S", "%M:%S"):
                try:
                    datetime.strptime(value, fmt)
                except ValueError:
                    continue
                else:
                    return True
            raise ValidationError(f"Value '{value}' do not match type '{field}'")
        case "5stars":
            try:
                value = int(value)
            except ValueError:
                raise ValidationError(f"Value '{value}' do not match type '{field}'")
            else:
                if 1 <= value <= 5:
                    return True
                else:
                    raise ValidationError(f"Value '{value}' do not match type '{field}'")
        case "10stars":
            try:
                value = int(value)
            except ValueError:
                raise ValidationError(f"Value '{value}' do not match type '{field}'")
            else:
                if 1 <= value <= 10:
                    return True
                else:
                    raise ValidationError(f"Value '{value}' do not match type '{field}'")
        case _:
            raise ValidationError(f"Got unexpected field type '{field}'")


def check_exercise_field(field: str, value: str) -> Literal[True]:
    match field:
        case "text":
            return True
        case "int":
            try:
                int(value)
            except ValueError:
                raise ValidationError(f"Value '{value}' do not match type '{field}'")
            else:
                return True
        case "float":
            try:
                float(value)
            except ValueError:
                raise ValidationError(f"Value '{value}' do not match type '{field}'")
            else:
                return True
        case "duration":
            for fmt in ("%H:%M:%S", "%M:%S"):
                try:
                    datetime.strptime(value, fmt)
                except ValueError:
                    continue
                else:
                    return True
            raise ValidationError(f"Value '{value}' do not match type '{field}'")
        case _:
            raise ValidationError(f"Got unexpected field type '{field}'")
