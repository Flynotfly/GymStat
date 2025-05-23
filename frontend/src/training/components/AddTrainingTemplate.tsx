// src/pages/NewTrainingTemplatePage.tsx
import {useMemo, useState} from "react";
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
import {createTrainingTemplate} from "../api";
import {
  NoteField,
  NewTrainingTemplateStringify,
} from "../types/trainingTemplate";
import ExerciseCard, { ExerciseUI } from "../components/ExerciseCard.tsx";


interface NoteUI {
  Name: string;
  Field: NoteField;
  Required: boolean;
  Default?: string;
}

// --- Validation helpers ---
function isDatetime(s: string): boolean {
  // YYYY-MM-DD HH:MM:SS
  const re = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
  if (!re.test(s)) return false;
  // try parsing by swapping space → T
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

function validateDefault(field: NoteField, def: string): boolean {
  switch (field) {
    case "Text":
      return true; // any string
    case "Datetime":
      return isDatetime(def);
    case "Duration":
      return isDuration(def);
    case "Number":
      return !isNaN(parseFloat(def));
    case "5stars":
      return is5stars(def);
    case "10stars":
      return is10stars(def);
    default:
      return false;
  }
}

export default function NewTrainingTemplatePage() {
  const navigate = useNavigate();

  const noteFieldOptions: NoteField[] = [
    "Text",
    "Datetime",
    "Duration",
    "Number",
    "5stars",
    "10stars",
  ];

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [notesUI, setNotesUI] = useState<NoteUI[]>([]);
  const [exercisesUI, setExercisesUI] = useState<ExerciseUI[]>([]);

  // Compute an array of default‐validation errors
  const defaultErrors = useMemo(() =>
    notesUI.map((n) => {
      if (n.Default == null || n.Default === "") return "";
      return validateDefault(n.Field, n.Default)
        ? ""
        : (() => {
          switch (n.Field) {
            case "Datetime":
              return "Expected format YYYY-MM-DD HH:MM:SS";
            case "Duration":
              return "Expected HH:MM:SS or MM:SS";
            case "Number":
              return "Must be a valid number";
            case "5stars":
              return "Integer 1–5";
            case "10stars":
              return "Integer 1–10";
            default:
              return "";
          }
        })();
    })
  , [notesUI]);

  const canSubmit =
    name.trim() !== "" &&
    defaultErrors.every((e) => e === "");


  const addNote = () =>
    setNotesUI((prev) => [...prev, { Name: "", Field: "Text", Required: false }]);
  const updateNote = (i: number, u: Partial<NoteUI>) =>
    setNotesUI((prev) =>
      prev.map((n, idx) => (idx === i ? { ...n, ...u } : n))
    );
  const removeNote = (i: number) =>
    setNotesUI((prev) => prev.filter((_, idx) => idx !== i));

  const addExercise = () => {
    setExercisesUI([
      ...exercisesUI,
      { template: null, fields: [] },
    ]);
  };

  const handleSubmit = () => {
    if (!canSubmit) return;

    const payload: NewTrainingTemplateStringify = {
      name: name.trim(),
      description: description.trim(),
      data: {
        ...(notesUI.length > 0 && {
          Notes: notesUI.map((n) => ({
            Name: n.Name,
            Field: n.Field,
            Required: n.Required ? "True" : "False",
            ...(n.Default ? { Default: n.Default } : {}),
          })),
        }),
        ...(exercisesUI.length > 0 && {
          Exercises: exercisesUI.map(ex => ({
            Template: ex.template!.id,
            Unit: ex.fields.reduce<Record<string,string>>((acc,f) => {
              if (f.unit) acc[f.name] = f.unit;
              return acc;
            }, {}),
            Sets: [
              ex.fields.reduce<Record<string,string|number>>((acc,f) => {
                acc[f.name] = f.default!;
                return acc;
              }, {}),
            ],
          })),
        }),
      },
    };
    console.log("Send template: ", payload)
    createTrainingTemplate(payload)
      .then(() => navigate("/app/trainings/templates"))
      .catch((err) =>
        console.error("Error creating training template:", err)
      );
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Add New Training Template
      </Typography>

      <TextField
        fullWidth
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        multiline
        minRows={3}
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        sx={{ mb: 3 }}
      />

      {/* Notes Section */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Notes
          </Typography>
          <Button size="small" startIcon={<AddIcon />} onClick={addNote}>
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
              {/* Name, Field, Required unchanged */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name"
                  value={note.Name}
                  onChange={(e) => updateNote(i, { Name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
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
              <Grid item xs={12} sm={6}>
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

              {/* Default with inline validation */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Default"
                  value={note.Default ?? ""}
                  onChange={(e) => updateNote(i, { Default: e.target.value })}
                  error={!!defaultErrors[i]}
                  helperText={defaultErrors[i]}
                />
              </Grid>
            </Grid>
          </Paper>
        ))}
      </Box>

      {/* Exercises Section */}
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

        {exercisesUI.map((ex, idx) => (
          <ExerciseCard
            key={idx}
            exercise={ex}
            onChange={updated => {
              setExercisesUI(ui =>
                ui.map((u, i) => (i === idx ? updated : u))
              );
            }}
            onRemove={() => {
              setExercisesUI(ui => ui.filter((_, i) => i !== idx));
            }}
          />
        ))}
      </Box>

      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={!canSubmit}
      >
        Create Training Template
      </Button>
    </Box>
  );
}
