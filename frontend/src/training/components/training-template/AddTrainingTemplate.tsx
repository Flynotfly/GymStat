// src/pages/AddTrainingPage.tsx
import { useState, useEffect } from "react";
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
  CircularProgress,
} from "@mui/material";
import { Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
import {
  DateTimePicker,
  LocalizationProvider,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { useNavigate, useParams } from "react-router-dom";
import {
  getSingleTraining,
  getSingleExerciseTemplate,
  createTraining,
  editTraining,
} from "../../api.ts";
import {
  NewTrainingStringify,
  TrainingStringify,
  TrainingNoteStringify,
  Exercise,
} from "../../types/training";
import { NoteField } from "../../types/trainingTemplate";
import { ExerciseTemplate } from "../../types/exerciseTemplate";
import { AllowedFieldName } from "../../constants/exerciseFields";
import ExerciseCard, { ExerciseUI } from "../training-template/ExerciseCard.tsx";

interface NoteUI {
  Name: string;
  Field: NoteField;
  Required: boolean;
  Value: string;
}

export default function AddTrainingPage() {
  const { trainingId } = useParams<{ trainingId: string }>();
  const isEdit = Boolean(trainingId);
  const navigate = useNavigate();

  // --- State for main fields ---
  const [conducted, setConducted] = useState<Dayjs | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // --- State for notes ---
  const [notesUI, setNotesUI] = useState<NoteUI[]>([]);

  // --- State for exercises ---
  const [exercisesUI, setExercisesUI] = useState<ExerciseUI[]>([]);

  // --- Loading flag for edit fetch ---
  const [loading, setLoading] = useState(false);

  const noteFieldOptions: NoteField[] = [
    "Text",
    "Datetime",
    "Duration",
    "Number",
    "5stars",
    "10stars",
  ];

  const canSubmit = conducted !== null;

  // Fetch existing training when in edit mode
  useEffect(() => {
    if (!isEdit) return;

    setLoading(true);

    (async () => {
      try {
        const found: TrainingStringify = await getSingleTraining(
          Number(trainingId)
        );

        // 1) Populate the date + title/description
        setConducted(dayjs(found.conducted));
        setTitle(found.title || "");
        setDescription(found.description || "");

        // 2) Populate notesUI
        setNotesUI(
          found.notes.map<NoteUI>((n) => ({
            Name: n.Name,
            Field: n.Field,
            Required: n.Required === "True",
            Value: n.Value,
          }))
        );

        // 3) Fetch each exercise's template, then build ExerciseUI[]
        const templatesArr: ExerciseTemplate[] = await Promise.all(
          found.exercises.map((ex) =>
            getSingleExerciseTemplate(ex.template)
          )
        );

        const populatedExercises: ExerciseUI[] = found.exercises.map(
          (ex, idx) => {
            const fullTpl: ExerciseTemplate = templatesArr[idx];

            // Pull out the very first "set"
            const firstSet = ex.sets && ex.sets.length > 0 ? ex.sets[0] : {};
            const fieldEntries: Array<{
              name: AllowedFieldName;
              default?: string;
              unit?: string;
            }> = [];

            for (const [fieldName, rawValue] of Object.entries(firstSet)) {
              const unitForField = ex.units ? ex.units[fieldName] : undefined;

              // Cast fieldName to AllowedFieldName, since TS knows it must match one of those
              const name = fieldName as AllowedFieldName;

              fieldEntries.push({
                name,
                default: String(rawValue),
                unit: unitForField,
              });
            }

            return {
              template: fullTpl,
              fields: fieldEntries,
            };
          }
        );

        setExercisesUI(populatedExercises);
      } catch (err) {
        console.error("Error fetching single training:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [isEdit, trainingId]);

  // --- Note handlers ---
  const addNote = () =>
    setNotesUI((prev) => [
      ...prev,
      { Name: "", Field: "Text", Required: false, Value: "" },
    ]);

  const updateNote = (i: number, u: Partial<NoteUI>) =>
    setNotesUI((prev) =>
      prev.map((n, idx) => (idx === i ? { ...n, ...u } : n))
    );

  const removeNote = (i: number) =>
    setNotesUI((prev) => prev.filter((_, idx) => idx !== i));

  // --- Exercise handlers ---
  const addExercise = () =>
    setExercisesUI((prev) => [
      ...prev,
      { template: null, fields: [] },
    ]);

  const updateExercise = (i: number, updated: ExerciseUI) =>
    setExercisesUI((prev) =>
      prev.map((ex, idx) => (idx === i ? updated : ex))
    );

  const removeExercise = (i: number) =>
    setExercisesUI((prev) => prev.filter((_, idx) => idx !== i));

  // --- Submit handler ---
  const handleSubmit = () => {
    if (!canSubmit || !conducted) return;

    // Map ExerciseUI → Exercise API shape
    const mapped: (Exercise | null)[] = exercisesUI.map((exUI, idx) => {
      if (!exUI.template) return null;

      const units = exUI.fields.reduce<Record<string, string>>((acc, f) => {
        if (f.unit) acc[f.name] = f.unit;
        return acc;
      }, {});

      const oneSet = exUI.fields.reduce<Record<string, string | number>>(
        (acc, f) => {
          const raw = f.default?.trim() ?? "";
          const asNum = Number(raw);
          acc[f.name] = raw === "" || isNaN(asNum) ? raw : asNum;
          return acc;
        },
        {}
      );

      return {
        template: exUI.template.id,
        order: idx + 1,
        units: Object.keys(units).length ? units : undefined,
        sets: Object.keys(oneSet).length ? [oneSet] : [],
      };
    });

    const validExercises: Exercise[] = mapped.filter(
      (e): e is Exercise => e !== null
    );

    const payload: NewTrainingStringify = {
      conducted: conducted.toISOString(),
      title: title.trim() || "",
      description: description.trim(),
      notes: notesUI.map<TrainingNoteStringify>((n) => ({
        Name: n.Name.trim(),
        Field: n.Field,
        Required: n.Required ? "True" : "False",
        Value: n.Value,
      })),
      exercises: validExercises,
    };

    if (isEdit) {
      const toEdit: TrainingStringify = {
        ...payload,
        id: Number(trainingId),
        owner: 0, // owner is ignored by API on edit
      };
      editTraining(toEdit)
        .then(() => {
          navigate("/app/trainings");
        })
        .catch((err) => {
          console.error("Error editing training:", err);
        });
    } else {
      createTraining(payload)
        .then(() => {
          navigate("/app/trainings");
        })
        .catch((err) => {
          console.error("Error creating training:", err);
        });
    }
  };

  if (isEdit && loading) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        {isEdit ? "Edit Training" : "Add New Training"}
      </Typography>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DateTimePicker
          label="Conducted"
          value={conducted}
          onChange={(newValue: Dayjs | null) => setConducted(newValue)}
          slotProps={{
            textField: { fullWidth: true, sx: { mb: 2 } },
          }}
        />
      </LocalizationProvider>

      <TextField
        fullWidth
        label="Title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
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

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Value"
                  value={note.Value}
                  onChange={(e) => updateNote(i, { Value: e.target.value })}
                />
              </Grid>
            </Grid>
          </Paper>
        ))}
      </Box>

      {/* Exercises Section */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Exercises
          </Typography>
          <Button size="small" startIcon={<AddIcon />} onClick={addExercise}>
            Add Exercise
          </Button>
        </Box>

        {exercisesUI.map((exUI, idx) => (
          <ExerciseCard
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
        {isEdit ? "Save Changes" : "Create Training"}
      </Button>
    </Box>
  );
}
