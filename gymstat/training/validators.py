from django.core.exceptions import ValidationError
from .utils import is_5stars, is_10stars, is_datetime, is_duration


NOTES_FIELDS = ["Text", "Datetime", "Duration", "Number", "5stars", "10stars"]


ALLOWED_EXERCISE_FIELDS = {
    "sets": "int",
    "reps": "int",
    "weight": ["float", ["kg", "lbs"]],
    "time": "duration",
    "distance": ["float", ["m", "km", "mi"]],
    "speed": ["float", ["kph", "mph", "mps"]],
    "rounds": "int",
    "rest": "duration",
    "rpe": "int",
    "attempts": "int",
    "successes": "int",
    "notes": "text",
    "tempo": "text",
}

ALLOWED_EXERCISE_TAGS = {
    "chest",
    "biceps",
    "cardio",
    "cycling",
    "running",
    "free weight",
    "machine",
    "triceps",
    "legs",
    "back",
    "shoulders",
    "abs",
    "core",
    "HIIT",
    "yoga",
    "pilates",
}


def _validate_json_list(
    value,
    field_name: str,
    allowed_values=None,
):
    if not isinstance(value, list):
        raise ValidationError(f"{field_name.capitalize()} must be a list.")
    if allowed_values:
        invalid_objs = [obj for obj in value if obj not in allowed_values]
        if invalid_objs:
            allowed_iterable = (
                allowed_values.keys()
                if isinstance(allowed_values, dict)
                else allowed_values
            )
            raise ValidationError(
                f"Invalid {field_name} provided: {', '.join(invalid_objs)}. "
                f"Allowed {field_name} are: {', '.join(allowed_iterable)}."
            )


def validate_training_template_data(data):
    if not isinstance(data, dict):
        raise ValidationError("Data must be a dictionary.")

    # Validate Notes
    notes = data.get("Notes")
    if notes is not None:
        if not isinstance(notes, list):
            raise ValidationError("Notes must be a list.")
        for note in notes:
            if not isinstance(note, dict):
                raise ValidationError("Each note must be a dictionary.")
            name = note.get("Name")
            field = note.get("Field")
            required = note.get("Required")
            default = note.get("Default", None)

            if not name:
                raise ValidationError("Note should have name.")
            if not isinstance(name, str):
                raise ValidationError("Note name must be a string.")
            if field not in NOTES_FIELDS:
                raise ValidationError(f"Invalid field '{field}' in note.")
            if required not in ["True", "False"]:
                raise ValidationError(
                    "Note 'Required' must be 'True' or 'False'."
                )
            if default is not None:
                if not isinstance(default, str):
                    raise ValidationError("Note 'Default' must be a string.")
                is_validation_error = False
                match field:
                    case "Datetime":
                        if not is_datetime(default):
                            is_validation_error = True
                    case "Duration":
                        if not is_duration(default):
                            is_validation_error = True
                    case "Number":
                        try:
                            float(default)
                        except ValueError:
                            is_validation_error = True
                    case "5stars":
                        if not is_5stars(default):
                            is_validation_error = True
                    case "10stars":
                        if not is_10stars(default):
                            is_validation_error = True

                if is_validation_error:
                    raise ValidationError(
                        f"Note's 'Default' value should match 'Field'."
                        f"Got 'Field' is {field} and 'Default' is {default}"
                    )

    # Validate Exercises
    exercises = data.get("Exercises")
    if exercises is not None:
        if not isinstance(exercises, list):
            raise ValidationError("Exercises must be a list.")
        for exercise in exercises:
            if not isinstance(exercise, dict):
                raise ValidationError("Each exercise must be a dictionary.")

            # Check required 'Template'
            template = exercise.get("Template")
            if template is None:
                raise ValidationError(
                    "'Template' field should be in each exercise."
                )

            try:
                int(template)
            except ValueError:
                raise ValidationError(
                    f"'Template' must be an integer in each exercise. Got '{template}'"
                )

            unit_dict = exercise.get("Unit", {})
            sets = exercise.get("Sets", [])
            if sets:
                if not isinstance(sets, list):
                    raise ValidationError("'Sets' must be a list.")
                for s in sets:
                    if not isinstance(s, dict):
                        raise ValidationError("Each set must be a dictionary.")
                    if not s:
                        raise ValidationError(
                            "Set dictionaries must not be empty."
                        )
                    for field, value in s.items():
                        allowed = ALLOWED_EXERCISE_FIELDS.get(field)
                        if allowed is None:
                            raise ValidationError(
                                f"Field '{field}' is not allowed."
                            )

                        if value == "":
                            continue  # Empty string allowed

                        # Validate field types and units
                        expected_type = (
                            allowed if isinstance(allowed, str) else allowed[0]
                        )
                        allowed_units = (
                            allowed[1] if isinstance(allowed, list) else None
                        )

                        if expected_type == "Int":
                            try:
                                int(value)
                            except ValueError:
                                raise ValidationError(
                                    f"'{field}' must be an integer."
                                )
                        elif expected_type == "Float":
                            try:
                                float(value)
                            except ValueError:
                                raise ValidationError(
                                    f"'{field}' must be a float."
                                )
                        elif expected_type == "Duration":
                            if not isinstance(value, str):
                                raise ValidationError(
                                    f"'{field}' must be a duration string."
                                )
                        elif expected_type == "Text":
                            if not isinstance(value, str):
                                raise ValidationError(
                                    f"'{field}' must be a string."
                                )
                        else:
                            raise ValidationError(
                                f"Unknown type '{expected_type}' for '{field}'."
                            )

                        # Validate units if applicable
                        if allowed_units:
                            unit_value = unit_dict.get(field)
                            if unit_value not in allowed_units:
                                raise ValidationError(
                                    f"Field '{field}' must have unit from {allowed_units}."
                                )


def validate_training_notes(value):
    if not isinstance(value, dict):
        raise ValidationError("Notes must be a dictionary.")
    for key, val in value.items():
        if not isinstance(key, str) or not isinstance(val, str):
            raise ValidationError(
                "Notes dictionary keys and values must be strings."
            )


def validate_exercise_template_fields(value):
    return _validate_json_list(value, "fields", ALLOWED_EXERCISE_FIELDS)


def validate_exercise_template_tags(value):
    return _validate_json_list(value, "tags", ALLOWED_EXERCISE_TAGS)


def validate_exercise_data(data, exercise_template):
    if not isinstance(data, dict):
        raise ValidationError("Exercise data must be a dictionary.")

    allowed_template_fields = (
        exercise_template.fields
    )  # Fields defined in template

    unit_dict = data.get("Unit", {})
    if unit_dict and not isinstance(unit_dict, dict):
        raise ValidationError("'Unit' must be a dictionary if provided.")

    sets = data.get("sets")
    if sets is None or not isinstance(sets, list) or not sets:
        raise ValidationError("'sets' must be a non-empty list.")

    for set_index, set_item in enumerate(sets, start=1):
        if not isinstance(set_item, dict) or not set_item:
            raise ValidationError(
                f"Each set must be a non-empty dictionary (error in set #{set_index})."
            )

        for field, value in set_item.items():
            if field not in allowed_template_fields:
                raise ValidationError(
                    f"Field '{field}' is not defined in ExerciseTemplate '{exercise_template.name}'."
                )

            allowed_field = ALLOWED_EXERCISE_FIELDS.get(field)
            if not allowed_field:
                raise ValidationError(f"Field '{field}' is not allowed.")

            if value == "":
                continue

            expected_type = (
                allowed_field
                if isinstance(allowed_field, str)
                else allowed_field[0]
            )
            allowed_units = (
                allowed_field[1] if isinstance(allowed_field, list) else None
            )

            try:
                if expected_type == "Int":
                    int(value)
                elif expected_type == "Float":
                    float(value)
                elif expected_type == "Duration":
                    if not isinstance(value, str):
                        raise ValidationError(
                            f"'{field}' must be a duration string."
                        )
                elif expected_type == "Text":
                    if not isinstance(value, str):
                        raise ValidationError(f"'{field}' must be a string.")
                else:
                    raise ValidationError(
                        f"Unsupported type '{expected_type}' for '{field}'."
                    )
            except ValueError:
                raise ValidationError(
                    f"'{field}' must be of type '{expected_type}'."
                )

            if allowed_units:
                unit_value = unit_dict.get(field)
                if unit_value not in allowed_units:
                    raise ValidationError(
                        f"Unit for '{field}' must be one of {allowed_units}."
                    )
