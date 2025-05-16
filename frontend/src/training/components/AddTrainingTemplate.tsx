// src/pages/NewTrainingTemplatePage.tsx
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
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { createTrainingTemplate } from "../api";
import {
  NoteField,
  NewTrainingTemplate,
} from "../types/trainingTemplate";

interface NoteUI {
  Name: string;
  Field: NoteField;
  Required: boolean;
  Default?: string;
}

interface ExerciseUI {
  Template: number;
  unitFields: { key: string; value: string }[];
  setsFields: { key: string; value: string }[][];
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

  const addNote = () => {
    setNotesUI([
      ...notesUI,
      { Name: "", Field: "Text", Required: false },
    ]);
  };

  const updateNote = (
    idx: number,
    updates: Partial<NoteUI>
  ) => {
    const newNotes = [...notesUI];
    newNotes[idx] = { ...newNotes[idx], ...updates };
    setNotesUI(newNotes);
  };

  const removeNote = (idx: number) => {
    setNotesUI(notesUI.filter((_, i) => i !== idx));
  };

  const addExercise = () => {
    setExercisesUI([
      ...exercisesUI,
      { Template: 0, unitFields: [], setsFields: [] },
    ]);
  };

  const updateExercise = (
    idx: number,
    updates: Partial<ExerciseUI>
  ) => {
    const newEx = [...exercisesUI];
    newEx[idx] = { ...newEx[idx], ...updates };
    setExercisesUI(newEx);
  };

  const removeExercise = (idx: number) => {
    setExercisesUI(exercisesUI.filter((_, i) => i !== idx));
  };

  const addUnitField = (exIdx: number) => {
    const ex = exercisesUI[exIdx];
    updateExercise(exIdx, {
      unitFields: [
        ...ex.unitFields,
        { key: "", value: "" },
      ],
    });
  };

  const updateUnitField = (
    exIdx: number,
    fieldIdx: number,
    updates: { key?: string; value?: string }
  ) => {
    const ex = exercisesUI[exIdx];
    const newUF = [...ex.unitFields];
    newUF[fieldIdx] = { ...newUF[fieldIdx], ...updates };
    updateExercise(exIdx, { unitFields: newUF });
  };

  const removeUnitField = (exIdx: number, fieldIdx: number) => {
    const ex = exercisesUI[exIdx];
    updateExercise(exIdx, {
      unitFields: ex.unitFields.filter((_, i) => i !== fieldIdx),
    });
  };

  const addSet = (exIdx: number) => {
    const ex = exercisesUI[exIdx];
    updateExercise(exIdx, {
      setsFields: [...ex.setsFields, []],
    });
  };

  const addSetPair = (exIdx: number, setIdx: number) => {
    const ex = exercisesUI[exIdx];
    const newSets = ex.setsFields.map((set, i) =>
      i === setIdx ? [...set, { key: "", value: "" }] : set
    );
    updateExercise(exIdx, { setsFields: newSets });
  };

  const updateSetPair = (
    exIdx: number,
    setIdx: number,
    pairIdx: number,
    updates: { key?: string; value?: string }
  ) => {
    const ex = exercisesUI[exIdx];
    const newSets = ex.setsFields.map((set, i) =>
      i !== setIdx
        ? set
        : set.map((pair, j) =>
          j === pairIdx ? { ...pair, ...updates } : pair
        )
    );
    updateExercise(exIdx, { setsFields: newSets });
  };

  const removeSetPair = (
    exIdx: number,
    setIdx: number,
    pairIdx: number
  ) => {
    const ex = exercisesUI[exIdx];
    const newSets = ex.setsFields.map((set, i) =>
      i === setIdx
        ? set.filter((_, j) => j !== pairIdx)
        : set
    );
    updateExercise(exIdx, { setsFields: newSets });
  };

  const removeSet = (exIdx: number, setIdx: number) => {
    const ex = exercisesUI[exIdx];
    updateExercise(exIdx, {
      setsFields: ex.setsFields.filter((_, i) => i !== setIdx),
    });
  };

  const handleSubmit = () => {
    const payload: NewTrainingTemplate = {
      name: name.trim(),
      description: description.trim(),
      data: {
        ...(notesUI.length > 0 && {
          Notes: notesUI.map((n) => ({
            Name: n.Name,
            Field: n.Field,
            Required: n.Required,
            ...(n.Default ? { Default: n.Default } : {}),
          })),
        }),
        ...(exercisesUI.length > 0 && {
          Exercises: exercisesUI.map((e) => ({
            Template: e.Template,
            ...(e.unitFields.length > 0 && {
              Unit: Object.fromEntries(
                e.unitFields.map(({ key, value }) => [
                  key,
                  value,
                ])
              ),
            }),
            Sets: e.setsFields.map((set) =>
              Object.fromEntries(
                set.map(({ key, value }) => [key, value])
              )
            ),
          })),
        }),
      },
    };

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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 1,
          }}
        >
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
          <Paper
            key={i}
            sx={{ p: 2, mb: 2, position: "relative" }}
          >
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
                    updateNote(
                      i,
                      { Field: e.target.value as NoteField }
                    )
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
                        updateNote(i, {
                          Required: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Required"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Default"
                  value={note.Default || ""}
                  onChange={(e) =>
                    updateNote(i, { Default: e.target.value })
                  }
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

        {exercisesUI.map((ex, exIdx) => (
          <Paper
            key={exIdx}
            sx={{ p: 2, mb: 2, position: "relative" }}
          >
            <IconButton
              size="small"
              sx={{ position: "absolute", top: 8, right: 8 }}
              onClick={() => removeExercise(exIdx)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>

            <TextField
              type="number"
              label="Template ID"
              value={ex.Template}
              onChange={(e) =>
                updateExercise(exIdx, {
                  Template: Number(e.target.value),
                })
              }
              sx={{ mb: 2 }}
            />

            {/* Unit Fields */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">
                Unit Fields
              </Typography>
              {ex.unitFields.map((uf, ufIdx) => (
                <Grid
                  container
                  spacing={1}
                  key={ufIdx}
                  alignItems="center"
                  sx={{ mb: 1 }}
                >
                  <Grid item xs={5}>
                    <TextField
                      fullWidth
                      placeholder="key"
                      value={uf.key}
                      onChange={(e) =>
                        updateUnitField(exIdx, ufIdx, {
                          key: e.target.value,
                        })
                      }
                    />
                  </Grid>
                  <Grid item xs={5}>
                    <TextField
                      fullWidth
                      placeholder="value"
                      value={uf.value}
                      onChange={(e) =>
                        updateUnitField(exIdx, ufIdx, {
                          value: e.target.value,
                        })
                      }
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <IconButton
                      onClick={() =>
                        removeUnitField(exIdx, ufIdx)
                      }
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => addUnitField(exIdx)}
              >
                Add Unit Field
              </Button>
            </Box>

            {/* Sets */}
            <Box>
              <Typography variant="subtitle1">
                Sets
              </Typography>
              {ex.setsFields.map((set, setIdx) => (
                <Paper
                  key={setIdx}
                  variant="outlined"
                  sx={{ p: 1, mb: 1 }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Typography>
                      Set #{setIdx + 1}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() =>
                        removeSet(exIdx, setIdx)
                      }
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  {set.map((pair, pairIdx) => (
                    <Grid
                      container
                      spacing={1}
                      key={pairIdx}
                      alignItems="center"
                      sx={{ mb: 1 }}
                    >
                      <Grid item xs={5}>
                        <TextField
                          fullWidth
                          placeholder="key"
                          value={pair.key}
                          onChange={(e) =>
                            updateSetPair(
                              exIdx,
                              setIdx,
                              pairIdx,
                              { key: e.target.value }
                            )
                          }
                        />
                      </Grid>
                      <Grid item xs={5}>
                        <TextField
                          fullWidth
                          placeholder="value"
                          value={pair.value}
                          onChange={(e) =>
                            updateSetPair(
                              exIdx,
                              setIdx,
                              pairIdx,
                              { value: e.target.value }
                            )
                          }
                        />
                      </Grid>
                      <Grid item xs={2}>
                        <IconButton
                          onClick={() =>
                            removeSetPair(
                              exIdx,
                              setIdx,
                              pairIdx
                            )
                          }
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  ))}
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => addSetPair(exIdx, setIdx)}
                  >
                    Add Field
                  </Button>
                </Paper>
              ))}
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={() => addSet(exIdx)}
              >
                Add Set
              </Button>
            </Box>
          </Paper>
        ))}
      </Box>

      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={!name.trim()}
      >
        Create Training Template
      </Button>
    </Box>
  );
}
