from django.core.exceptions import ValidationError

from training.constants import (
    ALLOWED_EXERCISE_FIELDS,
    ALLOWED_EXERCISE_TAGS,
    NOTES_FIELDS,
)

from .utils import check_exercise_field, check_note_field


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
                try:
                    check_note_field(field, default)
                except ValidationError:
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

                        check_exercise_field(expected_type, value)

                        # Validate units if applicable
                        if allowed_units:
                            unit_value = unit_dict.get(field)
                            if unit_value not in allowed_units:
                                raise ValidationError(
                                    f"Field '{field}' must have unit from {allowed_units}."
                                )


def validate_training_notes(notes):
    if not notes:
        return
    if not isinstance(notes, list):
        raise ValidationError("Notes must be a list or None.")
    for note in notes:
        if not isinstance(note, dict):
            raise ValidationError("Each note must be a dict.")

        expected_keys = {"Name", "Field", "Required", "Value"}
        actual_keys = set(note.keys())
        if actual_keys != expected_keys:
            raise ValidationError(
                "Each note must have exactly these keys: Name, Field, Required, Value."
            )

        # Name: non‐empty string
        name = note["Name"]
        if not isinstance(name, str) or not name.strip():
            raise ValidationError("Note ‘Name’ must be a non‐empty string.")

        # Field: must be one of the allowed NOTES_FIELDS
        field = note["Field"]
        if field not in NOTES_FIELDS:
            raise ValidationError(
                f"Note ‘Field’ value '{field}' is not valid."
            )

        # Required: string "True" or "False"
        required = note["Required"]
        if required not in ("True", "False"):
            raise ValidationError(
                "Note ‘Required’ must be the string 'True' or 'False'."
            )

        # Value: must be a string; if required=="True", must be non‐empty
        value = note["Value"]
        if not isinstance(value, str):
            raise ValidationError("Note ‘Value’ must be a string.")
        if required == "True" and not value:
            raise ValidationError(
                "This note is required but its ‘Value’ is empty."
            )
        if value:
            check_note_field(field, value)


def validate_exercise_template_fields(value):
    return _validate_json_list(value, "fields", ALLOWED_EXERCISE_FIELDS)


def validate_exercise_template_tags(value):
    return _validate_json_list(value, "tags", ALLOWED_EXERCISE_TAGS)


def validate_exercise_units(units):
    if not units:
        return
    if not isinstance(units, dict):
        raise ValidationError("'Units' field must be a dict")
    for key, value in units.items():
        if key not in ALLOWED_EXERCISE_FIELDS:
            raise ValidationError(
                f"Got unexpected field {key} in 'Unit'. Allowed fields: {', '.join(ALLOWED_EXERCISE_FIELDS)}"
            )
        field_type = ALLOWED_EXERCISE_FIELDS[key]
        if isinstance(field_type, str):
            raise ValidationError(
                f"Field {key} don't require unit. Don't put it in 'Unit'"
            )
        _, allowed_units = field_type
        if value not in allowed_units:
            raise ValidationError(
                f"Unit {value} not supported in {key} field. Allowed units for {key} field: {', '.join(allowed_units)}"
            )


def validate_exercise_sets(sets):
    if not sets:
        return
    if not isinstance(sets, list):
        raise ValidationError("'Sets' field must be a list")
    for exercise in sets:
        if not isinstance(exercise, dict):
            raise ValidationError(
                "Exercise inside of 'Sets' list must be a dict"
            )
        for field, value in exercise.items():
            if field not in ALLOWED_EXERCISE_FIELDS:
                raise ValidationError(
                    f"Got unexpected field {field} in 'Sets'. Allowed fields: {', '.join(ALLOWED_EXERCISE_FIELDS)}"
                )
            field_type = ALLOWED_EXERCISE_FIELDS[field]
            if isinstance(field_type, list):
                field_type = field_type[0]
            check_exercise_field(field_type, value)
