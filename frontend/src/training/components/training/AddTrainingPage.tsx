// src/pages/NewTrainingPage.tsx
import { useState } from "react";
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
import { Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
import {
  DateTimePicker,
  LocalizationProvider,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";
import { useNavigate } from "react-router-dom";
import { createTraining } from "../../api.ts";
import {
  NewTrainingStringify,
  TrainingNoteStringify,
} from "../../types/training";
import { NoteField } from "../../types/trainingTemplate"

interface NoteUI {
  Name: string;
  Field: NoteField;
  Required: boolean;
  Value: string;
}

export default function NewTrainingPage() {
  const navigate = useNavigate();

  // --- State for the three main fields ---
  const [conducted, setConducted] = useState<Dayjs | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // --- State for notes ---
  const [notesUI, setNotesUI] = useState<NoteUI[]>([]);

  // Predefined options for the NoteField dropdown
  const noteFieldOptions: NoteField[] = [
    "Text",
    "Datetime",
    "Duration",
    "Number",
    "5stars",
    "10stars",
  ];

  // Can submit as long as we have a datetime; title is optional
  const canSubmit = conducted !== null;

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

  const handleSubmit = () => {
    if (!canSubmit || !conducted) return;

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
      exercises: [],
    };

    createTraining(payload)
      .then(() => {
        navigate("/app/trainings");
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
                  onChange={(e) =>
                    updateNote(i, { Name: e.target.value })
                  }
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
                  onChange={(e) =>
                    updateNote(i, { Value: e.target.value })
                  }
                />
              </Grid>
            </Grid>
          </Paper>
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
