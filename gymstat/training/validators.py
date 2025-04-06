from django.core.exceptions import ValidationError


NOTES_FIELDS = ["Text", "Datetime", "Duration", "Number", "5stars", "10stars"]


ALLOWED_EXERCISE_FIELDS = {
    "Sets": "Int",
    "Reps": "Int",
    "Weight": ["Float", ["kg", "lbs"]],
    "Time": "Duration",
    "Distance": ["Float", ["m", "km", "mi"]],
    "Speed": ["Float", ["kph", "mph", "mps"]],
    "Rounds": "Int",
    "Rest": "Duration",
    "RPE": "Int",
    "Attempts": "Int",
    "Successes": "Int",
    "Notes": "Text",
    "Tempo": "Text",
}


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
            field = note.get("field")
            required = note.get("Required")
            default = note.get("Default", "")

            if not isinstance(name, str):
                raise ValidationError("Note name must be a string.")
            if field not in NOTES_FIELDS:
                raise ValidationError(f"Invalid field '{field}' in note.")
            if required not in ["True", "False"]:
                raise ValidationError(
                    "Note 'Required' must be 'True' or 'False'."
                )
            if not isinstance(default, str):
                raise ValidationError("Note 'Default' must be a string.")

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
            if template is None or not isinstance(template, int):
                raise ValidationError(
                    "'Template' must be an integer in each exercise."
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
    if not isinstance(value, list):
        raise ValidationError("Fields must be a list.")
    invalid_fields = [
        field for field in value if field not in ALLOWED_EXERCISE_FIELDS
    ]
    if invalid_fields:
        raise ValidationError(
            f"Invalid fields provided: {', '.join(invalid_fields)}. "
            f"Allowed fields are: {', '.join(ALLOWED_EXERCISE_FIELDS.keys())}."
        )
