// src/components/ExerciseCard.tsx
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
import {
  ALLOWED_EXERCISE_FIELDS,
  AllowedFieldName,
} from "../constants/exerciseFields";
import { ExerciseTemplate } from "../types/exerciseTemplate";
import ExerciseTemplatePicker from "./ExerciseTemplatePicker";

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
  // Reset fields when template changes
  useEffect(() => {
    if (!exercise.template) {
      onChange({ ...exercise, fields: [] });
      return;
    }
    const defaults: FieldUI[] = (exercise.template
        .fields as AllowedFieldName[]
    ).map((fieldName) => {
      const spec = ALLOWED_EXERCISE_FIELDS[fieldName];
      const unit = Array.isArray(spec) ? spec[1][0] : undefined;
      return { name: fieldName, unit, default: "" };
    });
    onChange({ ...exercise, fields: defaults });
  }, [exercise.template]);

  // Which fields remain available
  const available = useMemo<AllowedFieldName[]>(
    () =>
      (Object.keys(ALLOWED_EXERCISE_FIELDS) as AllowedFieldName[]).filter(
        (k) => !exercise.fields.some((f) => f.name === k)
      ),
    [exercise.fields]
  );

  // Handlers
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

  // Validate default values
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
      <ExerciseTemplatePicker
        value={exercise.template?.id ?? null}
        onChange={(tpl) => onChange({ ...exercise, template: tpl })}
      />

      <IconButton
        size="small"
        sx={{ position: "absolute", top: 8, right: 8 }}
        onClick={onRemove}
      >
        <DeleteIcon />
      </IconButton>

      <Typography variant="subtitle1" gutterBottom>
        {exercise.template?.name || "No template chosen"}
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        {exercise.template?.description}
      </Typography>

      {exercise.fields.map((f, idx) => {
        const spec = ALLOWED_EXERCISE_FIELDS[f.name];
        const units: readonly string[] = Array.isArray(spec) ? spec[1] : [];
        return (
          <Grid
            container
            spacing={1}
            alignItems="center"
            key={idx}
            sx={{ mb: 1 }}
          >
            <Grid item xs={4}>
              <Select
                fullWidth
                value={f.name}
                onChange={(e) =>
                  replaceField(idx, e.target.value as AllowedFieldName)
                }
              >
                {[f.name, ...available].map((opt) => (
                  <MenuItem key={opt} value={opt}>
                    {opt}
                  </MenuItem>
                ))}
              </Select>
            </Grid>

            {units.length > 0 && (
              <Grid item xs={3}>
                <Select
                  fullWidth
                  value={f.unit}
                  onChange={(e) => changeUnit(idx, e.target.value)}
                >
                  {units.map((u: string) => (
                    <MenuItem key={u} value={u}>
                      {u}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>
            )}

            <Grid item xs={units?.length ? 4 : 7}>
              <TextField
                fullWidth
                value={f.default || ""}
                onChange={(e) => changeDefault(idx, e.target.value)}
                error={!!defaultErrors[idx]}
                helperText={defaultErrors[idx]}
              />
            </Grid>

            <Grid item xs={1}>
              <IconButton size="small" onClick={() => removeField(idx)}>
                <DeleteIcon />
              </IconButton>
            </Grid>
          </Grid>
        );
      })}

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
