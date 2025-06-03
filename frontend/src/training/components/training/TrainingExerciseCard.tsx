import { useEffect, useMemo } from "react";
import {
  Paper,
  Box,
  Typography,
  Grid,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Button,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Delete as DeleteIcon } from "@mui/icons-material";

import { ALLOWED_EXERCISE_FIELDS, AllowedFieldName } from "../../constants/exerciseFields";
import { ExerciseTemplate } from "../../types/exerciseTemplate";
import ExerciseTemplatePicker from "../exercise-template/ExerciseTemplatePicker";

export interface ExerciseUnitUI {
  weight?: "kg" | "lbs";
  distance?: "m" | "km" | "mi";
  speed?: "kph" | "mph" | "mps";
}

export interface TrainingExerciseUI {
  template: ExerciseTemplate | null;
  units: Record<string, string>;
  // Each “set” here is an object whose keys = field names (e.g. "reps", "weight", etc.)
  setsUI: Array<Record<string, string>>;
}

interface Props {
  exercise: TrainingExerciseUI;
  onChange: (ex: TrainingExerciseUI) => void;
  onRemove: () => void;
}

export default function TrainingExerciseCard({
                                               exercise,
                                               onChange,
                                               onRemove,
                                             }: Props) {
  // Whenever the template changes, reset units + setsUI to a single empty set:
  useEffect(() => {
    if (!exercise.template) {
      onChange({ ...exercise, units: {}, setsUI: [] });
      return;
    }

    // Build a default “units” dict from template.fields:
    const defaultUnits: Record<string, string> = {};
    (
      (exercise.template.fields as AllowedFieldName[]) // e.g. ["reps", "weight", "time"]
    ).forEach((fieldName) => {
      const spec = ALLOWED_EXERCISE_FIELDS[fieldName];
      if (Array.isArray(spec)) {
        // spec = [type, allowedUnits[]]
        const allowedUnits = spec[1];
        defaultUnits[fieldName] = allowedUnits[0]; // pick first as default
      }
    });

    // Build an initial single “set” with all fields present (blank string)
    const initialSet: Record<string, string> = {};
    (exercise.template.fields as AllowedFieldName[]).forEach((fieldName) => {
      initialSet[fieldName] = "";
    });

    onChange({
      template: exercise.template,
      units: defaultUnits,
      setsUI: [initialSet],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercise.template]);

  // Which fields remain? We totally rely on template.fields.
  const fieldNames = useMemo(
    () => (exercise.template ? (exercise.template.fields as AllowedFieldName[]) : []),
    [exercise.template]
  );

  // Handlers for changing units & sets
  const changeUnit = (fieldName: string, newUnit: string) => {
    onChange({
      ...exercise,
      units: { ...exercise.units, [fieldName]: newUnit },
    });
  };

  const changeSetValue = (
    setIdx: number,
    fieldName: string,
    newVal: string
  ) => {
    const newSets = exercise.setsUI.map((s, i) =>
      i === setIdx ? { ...s, [fieldName]: newVal } : s
    );
    onChange({ ...exercise, setsUI: newSets });
  };

  const removeSet = (setIdx: number) => {
    onChange({
      ...exercise,
      setsUI: exercise.setsUI.filter((_, i) => i !== setIdx),
    });
  };

  const addSet = () => {
    // Create a blank “row” with all keys = "":
    const newBlank: Record<string, string> = {};
    fieldNames.forEach((f) => (newBlank[f] = ""));
    onChange({ ...exercise, setsUI: [...exercise.setsUI, newBlank] });
  };

  return (
    <Paper sx={{ p: 2, mb: 2, position: "relative" }}>
      <ExerciseTemplatePicker
        value={exercise.template?.id ?? null}
        onChange={(tpl) =>
          onChange({ ...exercise, template: tpl, units: {}, setsUI: [] })
        }
      />

      <IconButton
        size="small"
        sx={{ position: "absolute", top: 8, right: 8 }}
        onClick={onRemove}
      >
        <DeleteIcon />
      </IconButton>

      {exercise.template ? (
        <>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: 1 }}>
            {exercise.template.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {exercise.template.description}
          </Typography>

          {/* --- UNIT SELECTORS (for fields that allow units) --- */}
          <Grid container spacing={1} sx={{ mb: 2 }}>
            {fieldNames.map((fName) => {
              const spec = ALLOWED_EXERCISE_FIELDS[fName];
              if (Array.isArray(spec)) {
                // spec = [type, allowedUnits[]]
                const allowedUnits = spec[1];
                return (
                  <Grid item xs={12} sm={4} key={fName}>
                    <Select
                      fullWidth
                      value={exercise.units[fName] || allowedUnits[0]}
                      onChange={(e) => changeUnit(fName, e.target.value)}
                    >
                      {allowedUnits.map((u: string) => (
                        <MenuItem key={u} value={u}>
                          {u}
                        </MenuItem>
                      ))}
                    </Select>
                  </Grid>
                );
              }
              return null;
            })}
          </Grid>

          {/* --- SET ROWS --- */}
          {exercise.setsUI.map((setRow, idx) => (
            <Grid
              container
              spacing={1}
              alignItems="center"
              key={idx}
              sx={{ mb: 1 }}
            >
              {fieldNames.map((fName) => {
                const spec = ALLOWED_EXERCISE_FIELDS[fName];
                // If spec is [type, units[]], then fName is something like “weight”, so we show a TextField plus a unit label
                const hasUnits = Array.isArray(spec);
                return (
                  <Grid
                    item
                    xs={hasUnits ? 4 : 6}
                    sm={hasUnits ? 3 : 4}
                    key={`${idx}-${fName}`}
                  >
                    <TextField
                      fullWidth
                      placeholder={fName}
                      value={setRow[fName]}
                      onChange={(e) =>
                        changeSetValue(idx, fName, e.target.value)
                      }
                      InputProps={{
                        endAdornment: hasUnits ? (
                          <Box
                            component="span"
                            sx={{
                              pl: 1,
                              color: "text.secondary",
                              fontSize: "0.9em",
                            }}
                          >
                            {exercise.units[fName]}
                          </Box>
                        ) : null,
                      }}
                    />
                  </Grid>
                );
              })}

              <Grid item xs={4} sm={3}>
                <IconButton size="small" onClick={() => removeSet(idx)}>
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}

          <Box>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={addSet}
              disabled={fieldNames.length === 0}
            >
              Add Set
            </Button>
          </Box>
        </>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          No template chosen.
        </Typography>
      )}
    </Paper>
  );
}
