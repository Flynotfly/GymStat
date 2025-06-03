import { useMemo, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Paper,
  IconButton,
  Grid,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

import {
  createTraining,
  // (you could also import editTraining / getTrainings / deleteTraining if you want listing/editing)
} from "../../api";
import {
  NoteField
} from "../../types/trainingTemplate";
import {
  TrainingNote,
  NewTrainingStringify,
} from "../../types/training";
import TrainingExerciseCard, {
  TrainingExerciseUI,
  ExerciseUnitUI,
} from "../training/TrainingExerciseCard";

// --- These are exactly the field‐types available for a TrainingNote ---
const noteFieldOptions: NoteField[] = [
  "Text",
  "Datetime",
  "Duration",
  "Number",
  "5stars",
  "10stars",
];

// --- Validation helpers for note “Value” field based on NoteField ---
function isDatetime(s: string): boolean {
  // YYYY-MM-DD HH:MM:SS
  const re = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
  if (!re.test(s)) return false;
  const d = new Date(s.replace(" ", "T"));
  return !isNaN(d.getTime());
}

function isDuration(s: string): boolean {
  // HH:MM:SS or MM:SS
  if (/^\d{2}:\d{2}:\d{2}$/.test(s)) return true;
  if (/^\d{2}:\d{2}$/.test(s)) return true;
  return false;
}

function is5stars(s: string): boolean {
  const n = parseInt(s, 10);
  return !isNaN(n) && n >= 1 && n <= 5;
}

function is10stars(s: string): boolean {
  const n = parseInt(s, 10);
  return !isNaN(n) && n >= 1 && n <= 10;
}

function validateNoteValue(field: NoteField, val: string): boolean {
  switch (field) {
    case "Text":
      return true; // any string is fine
    case "Datetime":
      return isDatetime(val);
    case "Duration":
      return isDuration(val);
    case "Number":
      return !isNaN(parseFloat(val));
    case "5stars":
      return is5stars(val);
    case "10stars":
      return is10stars(val);
    default:
      return false;
  }
}

interface NoteUI {
  Name: string;
  Field: NoteField;
  Required: boolean;
  Value: string;
}

export default function AddTrainingPage() {
  const navigate = useNavigate();

  // --- Top‐level fields for “NewTraining” ---
  const [title, setTitle] = useState("");
  const [conducted, setConducted] = useState<Date | null>(new Date());
  const [templateId, setTemplateId] = useState<number | "">("");
  const [description, setDescription] = useState("");

  // --- Dynamic UI for notes & exercises ---
  const [notesUI, setNotesUI] = useState<NoteUI[]>([]);
  const [exercisesUI, setExercisesUI] = useState<TrainingExerciseUI[]>([]);

  // Compute validation errors for notes (based on their Field/type)
  const noteErrors = useMemo(
    () =>
      notesUI.map((n) => {
        if (n.Value.trim() === "") {
          return n.Required ? "Required" : "";
        }
        return validateNoteValue(n.Field, n.Value)
          ? ""
          : (() => {
            switch (n.Field) {
              case "Datetime":
                return "Expected YYYY-MM-DD HH:MM:SS";
              case "Duration":
                return "Expected HH:MM:SS or MM:SS";
              case "Number":
                return "Must be a number";
              case "5stars":
                return "Integer 1–5";
              case "10stars":
                return "Integer 1–10";
              default:
                return "";
            }
          })();
      }),
    [notesUI]
  );

  // Can submit only if title is nonempty, a conducted date is chosen, and no note has an error
  const canSubmit =
    title.trim() !== "" &&
    conducted !== null &&
    noteErrors.every((e) => e === "");

  // --- NOTE handlers ---
  const addNote = () =>
    setNotesUI((prev) => [
      ...prev,
      { Name: "", Field: "Text", Required: false, Value: "" },
    ]);
  const updateNote = (idx: number, patch: Partial<NoteUI>) =>
    setNotesUI((prev) =>
      prev.map((n, i) => (i === idx ? { ...n, ...patch } : n))
    );
  const removeNote = (idx: number) =>
    setNotesUI((prev) => prev.filter((_, i) => i !== idx));

  // --- EXERCISE handlers (use TrainingExerciseCard below) ---
  const addExercise = () =>
    setExercisesUI((prev) => [
      ...prev,
      // start with no template, no units, no sets
      { template: null, units: {}, setsUI: [] },
    ]);

  const updateExercise = (idx: number, updated: TrainingExerciseUI) =>
    setExercisesUI((prev) =>
      prev.map((ex, i) => (i === idx ? updated : ex))
    );
  const removeExercise = (idx: number) =>
    setExercisesUI((prev) => prev.filter((_, i) => i !== idx));

  // --- When user clicks “Submit” → build payload and call createTraining() ---
  const handleSubmit = () => {
    if (!canSubmit || conducted === null) return;

    // Build notes payload as TrainingNoteStringify[]
    const notesPayload = notesUI.map<TrainingNote>((n) => ({
      Name: n.Name.trim(),
      Field: n.Field,
      Required: n.Required,
      Value: n.Value.trim(),
    }));

    // Build exercises payload
    // Each exerciseUI has: template (ExerciseTemplate or null), units: Record<field, unit>, setsUI: Array<Record<field, string>>
    const exercisesPayload = exercisesUI.map((exUI, idx) => {
      const payload: any = {
        template: exUI.template!.id,
        order: idx,
      };

      // Build units field (only include if present)
      const unitObj: ExerciseUnitUI = {};
      for (const [fieldName, u] of Object.entries(exUI.units)) {
        if (u) {
          // we only expect “weight”, “distance”, or “speed” to be keys here
          (unitObj as any)[fieldName] = u;
        }
      }
      if (Object.keys(unitObj).length > 0) {
        payload.units = unitObj;
      }

      // Build sets: array of ExerciseSet
      // For each setsUI entry (which is Record<fieldName, string>), convert to correct types:
      const setsArr = exUI.setsUI.map((setObj) => {
        const converted: any = {};
        for (const [fieldName, rawVal] of Object.entries(setObj)) {
          const spec = rawVal.trim();
          // If fieldName is one of the numeric fields, parse to number
          if (["sets", "reps", "weight", "distance", "speed", "rounds", "rpe", "attempts", "successes"].includes(fieldName)) {
            const num = parseFloat(spec);
            if (!isNaN(num)) {
              converted[fieldName] = num;
            }
          } else {
            // e.g. “time”, “rest”, “notes”, “tempo” → leave as string if non‐empty
            if (spec !== "") {
              converted[fieldName] = spec;
            }
          }
        }
        return converted;
      });
      if (setsArr.length > 0) {
        payload.sets = setsArr;
      }

      return payload;
    });

    // Build final “NewTrainingStringify”:
    const payload: NewTrainingStringify = {
      conducted: conducted.toISOString(), // backend expects a string
      title: title.trim(),
      ...(templateId !== "" && { template: Number(templateId) }),
      description: description.trim(),
      notes: notesPayload.map((n) => ({
        Name: n.Name,
        Field: n.Field,
        Required: n.Required ? "True" : "False",
        Value: n.Value,
      })),
      exercises: exercisesPayload,
    };

    createTraining(payload)
      .then(() => {
        // after successful creation, navigate back to listing
        navigate("/app/trainings/");
      })
      .catch((err) => {
        console.error("Error creating training:", err);
      });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Add New Training
      </Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="Conducted"
              value={conducted}
              onChange={(newDate) => setConducted(newDate)}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </LocalizationProvider>
        </Grid>

        {/* (Optional) Template selector: if you have an endpoint to fetch all template IDs/names you can fill this */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Template ID (optional)"
            type="number"
            value={templateId}
            onChange={(e) =>
              setTemplateId(e.target.value === "" ? "" : Number(e.target.value))
            }
            helperText="(Enter an existing template ID if desired)"
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Grid>
      </Grid>

      {/* ----- NOTES SECTION ----- */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Notes
          </Typography>
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={addNote}
          >
            Add Note
          </Button>
        </Box>

        {notesUI.map((note, i) => (
          <Paper key={i} sx={{ p: 2, mb: 2, position: "relative" }}>
            <IconButton
              size="small"
              sx={{ position: "absolute", top: 8, right: 8 }}
              onClick={() => removeNote(i)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Name"
                  value={note.Name}
                  onChange={(e) => updateNote(i, { Name: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <Select
                  fullWidth
                  value={note.Field}
                  onChange={(e) =>
                    updateNote(i, { Field: e.target.value as NoteField })
                  }
                >
                  {noteFieldOptions.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>

              <Grid item xs={12} sm={2}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={note.Required}
                      onChange={(e) =>
                        updateNote(i, { Required: e.target.checked })
                      }
                    />
                  }
                  label="Required"
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Value"
                  value={note.Value}
                  onChange={(e) => updateNote(i, { Value: e.target.value })}
                  error={!!noteErrors[i]}
                  helperText={noteErrors[i]}
                />
              </Grid>
            </Grid>
          </Paper>
        ))}
      </Box>

      {/* ----- EXERCISES SECTION ----- */}
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Exercises
          </Typography>
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={addExercise}
          >
            Add Exercise
          </Button>
        </Box>

        {exercisesUI.map((exUI, idx) => (
          <TrainingExerciseCard
            key={idx}
            exercise={exUI}
            onChange={(updated) => updateExercise(idx, updated)}
            onRemove={() => removeExercise(idx)}
          />
        ))}
      </Box>

      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={!canSubmit}
      >
        Create Training
      </Button>
    </Box>
  );
}
