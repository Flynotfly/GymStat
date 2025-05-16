// src/pages/NewTrainingTemplatePage.tsx
import {useEffect, useMemo, useRef, useState} from "react";
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
  Grid, CircularProgress, Autocomplete,
} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {createTrainingTemplate, getExerciseTemplates} from "../api";
import {
  NoteField,
  NewTrainingTemplateStringify,
} from "../types/trainingTemplate";
import {ExerciseTemplate} from "../types/exerciseTemplate";

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

  const [exOptions, setExOptions] = useState<ExerciseTemplate[]>([]);
  const [exPage, setExPage] = useState<number>(1);
  const [exHasMore, setExHasMore] = useState<boolean>(true);
  const [exLoading, setExLoading] = useState<boolean>(false);
  const [exSearch, setExSearch] = useState<string>("");
  const listboxRef = useRef<HTMLUListElement>(null);

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
    console.log("Send template: ", payload)
    createTrainingTemplate(payload)
      .then(() => navigate("/app/trainings/templates"))
      .catch((err) =>
        console.error("Error creating training template:", err)
      );
  };

  // Fetcher for exercise‐templates
  const fetchExTemplates = (page: number, search: string, append = false) => {
    setExLoading(true);
    getExerciseTemplates(page, search)
      .then(({ results, next }) => {
          setExOptions(prev => append ? [...prev, ...results] : results);
          setExPage(page + 1);
          setExHasMore(!!next);
        })
      .finally(() => setExLoading(false));
  };

  // Reset on search change
  useEffect(() => {
    setExOptions([]);
    setExPage(1);
    setExHasMore(true);
    fetchExTemplates(1, exSearch, false);
  }, [exSearch]);

  // Infinite‐scroll on dropdown
  useEffect(() => {
    const lb = listboxRef.current;
    if (!lb) return;
    const onScroll = () => {
        if (lb.scrollTop + lb.clientHeight >= lb.scrollHeight - 20 &&
              exHasMore && !exLoading) {
            fetchExTemplates(exPage, exSearch, true);
          }
      };
    lb.addEventListener("scroll", onScroll);
    return () => lb.removeEventListener("scroll", onScroll);
  }, [exPage, exHasMore, exLoading]);

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

            <Autocomplete
              openOnFocus
              getOptionLabel={(opt) => opt.name}
              options={exOptions}
              loading={exLoading}
              value={exOptions.find(o => o.id === ex.Template) || null}
              onChange={(_, v) =>
                updateExercise(exIdx, { Template: v ? v.id : 0 })
              }
              onInputChange={(_, v) => setExSearch(v)}
              ListboxProps={{ ref: listboxRef }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Choose Exercise Template"
                  sx={{ mb: 2 }}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {exLoading && <CircularProgress size={20} />}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />;

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
        disabled={!canSubmit}
      >
        Create Training Template
      </Button>
    </Box>
  );
}
