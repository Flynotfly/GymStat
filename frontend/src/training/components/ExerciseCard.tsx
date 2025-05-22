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
import AddIcon from '@mui/icons-material/Add';
import { Delete as DeleteIcon } from "@mui/icons-material";
import {
  ALLOWED_EXERCISE_FIELDS,
  AllowedFieldName,
} from "../constants/exerciseFields";
import { ExerciseTemplate } from "../types/exerciseTemplate";

type FieldUI = {
  name: AllowedFieldName;
  unit?: string;
  default?: string;
};

export interface ExerciseUI {
  /** The full template object (with id, name, description, defaultFields) */
  template: ExerciseTemplate | null;
  /** User’s chosen fields for this exercise */
  fields: FieldUI[];
}

interface Props {
  exercise: ExerciseUI;
  onChange: (ex: ExerciseUI) => void;
  onRemove: () => void;
}

export default function ExerciseCard({ exercise, onChange, onRemove }: Props) {
  // 1) Whenever user picks a different template, reset fields to the template’s defaults
  useEffect(() => {
    if (!exercise.template) return;
    const defaults = (exercise.template.fields as AllowedFieldName[]).map(
      (fieldName) => {
        const spec = ALLOWED_EXERCISE_FIELDS[fieldName];
        // if spec is [type, units], pick first unit by default
        const unit = Array.isArray(spec) ? spec[1][0] : undefined;
        return { name: fieldName, unit, default: "" };
      }
    );
    onChange({ ...exercise, fields: defaults });
  }, [exercise.template?.id]);

  // 2) track which fields are still available to add
  const available = useMemo<AllowedFieldName[]>(
    () =>
      (Object.keys(ALLOWED_EXERCISE_FIELDS) as AllowedFieldName[]).filter(
        (k) => !exercise.fields.find((f) => f.name === k)
      ),
    [exercise.fields]
  );

  // 3) handlers
  const replaceField = (idx: number, name: AllowedFieldName) => {
    const spec = ALLOWED_EXERCISE_FIELDS[name];
    const unit = Array.isArray(spec) ? spec[1][0] : undefined;
    const newFields = [...exercise.fields];
    newFields[idx] = { name, unit, default: "" };
    onChange({ ...exercise, fields: newFields });
  };
  const changeUnit = (idx: number, unit: string) => {
    const newFields = [...exercise.fields];
    newFields[idx].unit = unit;
    onChange({ ...exercise, fields: newFields });
  };
  const changeDefault = (idx: number, val: string) => {
    const newFields = [...exercise.fields];
    newFields[idx].default = val;
    onChange({ ...exercise, fields: newFields });
  };
  const removeField = (idx: number) => {
    onChange({
      ...exercise,
      fields: exercise.fields.filter((_, i) => i !== idx),
    });
  };
  const addField = () => {
    if (available.length === 0) return;
    const name = available[0];
    const spec = ALLOWED_EXERCISE_FIELDS[name];
    const unit = Array.isArray(spec) ? spec[1][0] : undefined;
    onChange({
      ...exercise,
      fields: [...exercise.fields, { name, unit, default: "" }],
    });
  };

  // 4) validation for “default” values
  const defaultErrors = useMemo(() => {
    return exercise.fields.map((f) => {
      if (!f.default) return "";
      const spec = ALLOWED_EXERCISE_FIELDS[f.name];
      const type = Array.isArray(spec) ? spec[0] : spec;
      switch (type) {
        case "int":
          return /^\d+$/.test(f.default) ? "" : "Must be integer";
        case "float":
          return !isNaN(parseFloat(f.default)) ? "" : "Must be number";
        case "duration":
          return /^\d{2}:\d{2}(:\d{2})?$/.test(f.default)
            ? ""
            : "Expected MM:SS or HH:MM:SS";
        case "text":
          return "";
        default:
          return "";
      }
    });
  }, [exercise.fields]);

  return (
    <Paper sx={{ p: 2, mb: 2, position: "relative" }}>
      <IconButton
        size="small"
        sx={{ position: "absolute", top: 8, right: 8 }}
        onClick={onRemove}
      >
        <DeleteIcon />
      </IconButton>

      {/* template header */}
      <Typography variant="subtitle1" gutterBottom>
        {exercise.template?.name || "No template chosen"}
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {exercise.template?.description}
      </Typography>

      {/* fields editor */}
      {exercise.fields.map((f, idx) => {
        const spec = ALLOWED_EXERCISE_FIELDS[f.name];
        const units: readonly string[] = Array.isArray(spec) ? spec[1] : null;
        return (
          <Grid container spacing={1} alignItems="center" key={idx} sx={{ mb: 1 }}>
            {/* choose field */}
            <Grid item xs={4}>
              <Select
                fullWidth
                value={f.name}
                onChange={(e) =>
                  replaceField(idx, e.target.value as AllowedFieldName)
                }
              >
                {/* allow re-selecting same field in this row */}
                {[f.name, ...available].map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </Select>
            </Grid>

            {/* if this field has units, render unit chooser */}
            {units && (
              <Grid item xs={3}>
                <Select
                  fullWidth
                  value={f.unit}
                  onChange={(e) => changeUnit(idx, e.target.value)}
                >
                  {units.map((u) => (
                    <MenuItem key={u} value={u}>
                      {u}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
            )}

            {/* default value input */}
            <Grid item xs={units ? 4 : 7}>
              <TextField
                fullWidth
                value={f.default || ""}
                onChange={(e) => changeDefault(idx, e.target.value)}
                error={!!defaultErrors[idx]}
                helperText={defaultErrors[idx]}
              />
            </Grid>

            {/* remove */}
            <Grid item xs={1}>
              <IconButton size="small" onClick={() => removeField(idx)}>
                <DeleteIcon />
              </IconButton>
            </Grid>
          </Grid>
        );
      })}

      {/* add-field button */}
      <Box>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={addField}
          disabled={available.length === 0}
        >
          Add Field
        </Button>
      </Box>
    </Paper>
  );
}
