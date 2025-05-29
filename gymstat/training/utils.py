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
                raise ValidationError("")
            else:
                return True
        case "Datetime":
            try:
                datetime.strptime(value, "%Y-%m-%d %H:%M:%S")
            except ValueError:
                raise ValidationError("")
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
            raise ValidationError("")
        case "5stars":
            try:
                value = int(value)
            except ValueError:
                raise ValidationError("")
            else:
                if 1 <= value <= 5:
                    return True
                else:
                    raise ValidationError("")
        case "10stars":
            try:
                value = int(value)
            except ValueError:
                raise ValidationError("")
            else:
                if 1 <= value <= 10:
                    return True
                else:
                    raise ValidationError("")
        case _:
            raise ValidationError("")


def check_exercise_field(field: str, value: str) -> Literal[True]:
    match field:
        case "text":
            return True
        case "int":
            try:
                int(value)
            except ValueError:
                raise ValidationError("")
            else:
                return True
        case "float":
            try:
                float(value)
            except ValueError:
                raise ValidationError("")
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
        case _:
            raise ValidationError("")


def is_datetime(string: str) -> bool:
    try:
        datetime.strptime(string, "%Y-%m-%d %H:%M:%S")
    except ValueError:
        return False
    else:
        return True


def is_duration(string: str) -> bool:
    for fmt in ("%H:%M:%S", "%M:%S"):
        try:
            datetime.strptime(string, fmt)
        except ValueError:
            pass
        else:
            return True
    return False


def is_5stars(string: str) -> bool:
    try:
        value = int(string)
    except ValueError:
        return False
    else:
        if 1 <= value <= 5:
            return True
        else:
            return False


def is_10stars(string: str) -> bool:
    try:
        value = int(string)
    except ValueError:
        return False
    else:
        if 1 <= value <= 10:
            return True
        else:
            return False

