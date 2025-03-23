import { useState, useEffect } from 'react';
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import AddIcon from '@mui/icons-material/Add';
import EventIcon from '@mui/icons-material/Event';
import dayjs, { Dayjs } from 'dayjs';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import Rating from '@mui/material/Rating';

// Import your API and types as needed
import { createTraining, getAllExercises, getAllTrainings, getTraining, updateTraining } from "../api";
import CustomDatePicker from "../components/CustomDatePicker.tsx";
import { TimePicker } from "@mui/x-date-pickers";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Exercise } from "./Exercises.tsx";
import { Autocomplete } from "@mui/material";

// ===== Interfaces =====
export interface TrainingShortInterface {
  id: number;
  title: string;
  date: string;
  time: string;
}

export interface TrainingInterface extends TrainingShortInterface {
  title: string;
  description: string;
  time: string;
  score: number;
  sets: {
    index: number;
    exerciseType: number;
    exerciseName: string;
    exercises: {
      index: number;
      repetitions: number;
      weight: number;
    }[];
  }[];
}

// ===== Training Details Component =====

interface TrainingDetailsProps {
  training: TrainingInterface;
}
function TrainingDetails({ training }: TrainingDetailsProps) {
  const [localTraining, setLocalTraining] = useState(training);

  useEffect(() => {
    setLocalTraining(training);
  }, [training]);

  return (
    <Box sx={{ border: '1px solid #ccc', p: 2, mb: 2 }}>
      <Typography variant="h6">{localTraining.title}</Typography>
      <Typography variant="body2">{localTraining.description}</Typography>
      <Typography variant="body2">Time: {localTraining.time}</Typography>
      <Typography variant="body2">Score: {localTraining.score}</Typography>
      <Divider sx={{ my: 1 }} />
      {localTraining.sets.map((set) => (
        <Box key={set.index} sx={{ mb: 1, p: 1, border: '1px solid #eee' }}>
          <Typography variant="subtitle2">
            Set {set.index} - Type: {set.exerciseName}
          </Typography>
          {set.exercises.map((exercise) => (
            <Box
              key={exercise.index}
              sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}
            >
              <Typography variant="body2">
                Exercise {exercise.index}: {exercise.repetitions} reps, {exercise.weight} kg
              </Typography>
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
}

// ===== Create/Edit Training Form Component =====
// We have added an optional "initialTraining" prop for editing functionality.
interface CreateTrainingFormProps {
  onSave: (data: Partial<TrainingInterface>) => void;
  initialDate?: Dayjs;
  initialTraining?: TrainingInterface;
}
function CreateTrainingForm({ onSave, initialDate, initialTraining }: CreateTrainingFormProps) {
  // Initialize state with initialTraining data if provided (for editing)
  const [title, setTitle] = useState(initialTraining ? initialTraining.title : "");
  const [date, setDate] = useState<Dayjs>(initialTraining ? dayjs(initialTraining.date) : (initialDate || dayjs()));
  const [time, setTime] = useState<Dayjs | null>(initialTraining ? dayjs(initialTraining.time, "HH:mm") : dayjs());
  const [description, setDescription] = useState(initialTraining ? initialTraining.description : "");
  const [score, setScore] = useState<number | null>(initialTraining ? initialTraining.score : null);

  // Store exercise types as an array of Exercise
  const [exerciseTypes, setExerciseTypes] = useState<Exercise[]>([]);

  // State for sets – each set contains its own exercises array
  const [sets, setSets] = useState<
    {
      index: number;
      exerciseType: number;
      exerciseName: string;
      exercises: {
        index: number;
        repetitions: number;
        weight: number;
      }[];
    }[]
  >(initialTraining ? initialTraining.sets : []);

  useEffect(() => {
    getAllExercises()
      .then((data: Exercise[]) => {
        setExerciseTypes(data);
        console.log("Exercise types: ", data);
      })
      .catch(err => console.log("Error fetching exercise types: ", err));
  }, []);

  // Add a new set with default values
  const handleAddSet = () => {
    const newSet = {
      index: sets.length + 1,
      exerciseType: 0,
      exerciseName: "",
      exercises: []
    };
    setSets([...sets, newSet]);
  };

  // Remove a set by its index in the array
  const handleRemoveSet = (setIndex: number) => {
    setSets(sets.filter((_, idx) => idx !== setIndex));
  };

  // Add an exercise to a specific set
  const handleAddExercise = (setIndex: number) => {
    setSets(
      sets.map((set, idx) => {
        if (idx === setIndex) {
          const newExercise = {
            index: set.exercises.length + 1,
            repetitions: 0,
            weight: 0
          };
          return { ...set, exercises: [...set.exercises, newExercise] };
        }
        return set;
      })
    );
  };

  // Update a field in an exercise for a given set
  const handleExerciseChange = (
    setIndex: number,
    exerciseIndex: number,
    field: keyof { repetitions: number; weight: number },
    value: any
  ) => {
    setSets(
      sets.map((set, idx) => {
        if (idx === setIndex) {
          const updatedExercises = set.exercises.map((ex, exIdx) => {
            if (exIdx === exerciseIndex) {
              return { ...ex, [field]: value };
            }
            return ex;
          });
          return { ...set, exercises: updatedExercises };
        }
        return set;
      })
    );
  };

  // Remove an exercise from a set
  const handleRemoveExercise = (setIndex: number, exerciseIndex: number) => {
    setSets(
      sets.map((set, idx) => {
        if (idx === setIndex) {
          const updatedExercises = set.exercises.filter(
            (_, exIdx) => exIdx !== exerciseIndex
          );
          return { ...set, exercises: updatedExercises };
        }
        return set;
      })
    );
  };

  const handleSave = () => {
    const formattedTime = time ? time.format("HH:mm") : "";
    const trainingData = {
      // If editing, you might want to include the training id as well.
      ...(initialTraining && { id: initialTraining.id }),
      title,
      date: date.format("YYYY-MM-DD"),
      time: formattedTime,
      description,
      score: score || 0,
      sets
    };
    console.info("Training Data:", trainingData);
    onSave(trainingData);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {initialTraining ? "Edit Training" : "Create New Training"}
      </Typography>
      <Stack spacing={2}>
        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
        />
        <DatePicker
          label="Choose date"
          value={date}
          onChange={(newValue) => {
            if (newValue) setDate(newValue);
          }}
        />
        <TimePicker
          label="Enter time"
          value={time}
          onChange={(newValue) => setTime(newValue)}
        />
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
        />
        <Box>
          <Typography component="legend">Score</Typography>
          <Rating
            name="score"
            value={score}
            onChange={(_, newValue) => setScore(newValue)}
          />
        </Box>

        {/* Sets Section */}
        <Box>
          <Typography variant="h6">Sets</Typography>
          {sets.map((set, setIdx) => (
            <Box
              key={setIdx}
              sx={{ border: "1px solid #ccc", p: 2, mb: 2, borderRadius: 1 }}
            >
              <Stack spacing={2}>
                <Autocomplete
                  options={exerciseTypes}
                  getOptionLabel={(option) => option.name}
                  value={exerciseTypes.find((et) => et.id === set.exerciseType) || null}
                  onChange={(_, newValue) => {
                    setSets((prevSets) =>
                      prevSets.map((setItem, idx) =>
                        idx === setIdx
                          ? {
                            ...setItem,
                            exerciseType: newValue ? newValue.id : 0,
                            exerciseName: newValue ? newValue.name : "",
                          }
                          : setItem
                      )
                    );
                  }}
                  renderInput={(params) => (
                    <TextField {...params} label="Exercise Type" variant="outlined" />
                  )}
                />

                {/* Exercises within the set */}
                <Box>
                  <Typography variant="subtitle1">Exercises</Typography>
                  {set.exercises.map((exercise, exIdx) => (
                    <Box
                      key={exIdx}
                      sx={{
                        border: "1px dashed #aaa",
                        p: 1,
                        mb: 1,
                        borderRadius: 1
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={2}
                        alignItems="center"
                      >
                        <TextField
                          label="Repetitions"
                          type="number"
                          value={exercise.repetitions}
                          onChange={(e) =>
                            handleExerciseChange(
                              setIdx,
                              exIdx,
                              "repetitions",
                              Number(e.target.value)
                            )
                          }
                        />
                        <TextField
                          label="Weight"
                          type="number"
                          value={exercise.weight}
                          onChange={(e) =>
                            handleExerciseChange(
                              setIdx,
                              exIdx,
                              "weight",
                              Number(e.target.value)
                            )
                          }
                        />
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => handleRemoveExercise(setIdx, exIdx)}
                        >
                          Remove Exercise
                        </Button>
                      </Stack>
                    </Box>
                  ))}
                  <Button
                    variant="outlined"
                    onClick={() => handleAddExercise(setIdx)}
                  >
                    Add Exercise
                  </Button>
                </Box>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleRemoveSet(setIdx)}
                >
                  Remove Set
                </Button>
              </Stack>
            </Box>
          ))}
          <Button variant="outlined" onClick={handleAddSet}>
            Add Set
          </Button>
        </Box>
        <Button variant="contained" onClick={handleSave}>
          Save
        </Button>
      </Stack>
    </Box>
  );
}

// ===== Main Training Page =====

export default function Training() {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [trainings, setTrainings] = useState<TrainingShortInterface[]>([]);
  const [selectedTrainingDetails, setSelectedTrainingDetails] = useState<TrainingInterface | null>(null);
  const [selectedTrainingId, setSelectedTrainingId] = useState<number | null>(null);
  const [isCreatingTraining, setIsCreatingTraining] = useState(false);
  // New state for editing an existing training.
  const [isEditingTraining, setIsEditingTraining] = useState(false);

  const fetchTrainings = () => {
    getAllTrainings()
      .then((data: TrainingShortInterface[]) => {
        setTrainings(data);
        console.log('trainings: ', data);
      })
      .catch(err => console.log("Error fetching trainings: ", err));
  };

  // Fetch all trainings on mount.
  useEffect(() => {
    fetchTrainings();
  }, []);

  // Navigation functions
  const goToNextTrainingDate = () => {
    const dates = trainings
      .map(t => dayjs(t.date))
      .filter(d => d.isAfter(selectedDate, 'day'));
    dates.sort((a, b) => a.diff(b));
    if (dates.length > 0) {
      setSelectedDate(dates[0]);
    } else {
      setSelectedDate(dayjs());
    }
  };

  const goToPrevTrainingDate = () => {
    const dates = trainings
      .map(t => dayjs(t.date))
      .filter(d => d.isBefore(selectedDate, 'day'));
    dates.sort((a, b) => b.diff(a));
    if (dates.length > 0) {
      setSelectedDate(dates[0]);
    }
  };

  const handleAddTrainingNow = () => {
    setIsCreatingTraining(true);
    // Ensure we are not in editing mode.
    setIsEditingTraining(false);
  };

  const handleAddTrainingForSelectedDay = () => {
    setIsCreatingTraining(true);
    setIsEditingTraining(false);
  };

  // Filter trainings for the selected day.
  const trainingsForSelectedDate = trainings.filter(t =>
    dayjs(t.date).isSame(selectedDate, 'day')
  );

  // Function to fetch training details using getTraining API.
  const fetchTrainingDetails = (trainingId: number) => {
    console.log('Start fetching training data for training ', trainingId);
    getTraining(trainingId)
      .then((data: TrainingInterface) => {
        setSelectedTrainingDetails(data);
        setSelectedTrainingId(trainingId);
        // When viewing an existing training, hide the create/edit form.
        setIsCreatingTraining(false);
        setIsEditingTraining(false);
        console.log('Fetch training: ', data);
      })
      .catch(err => {
        console.log("Error fetching training details: ", err);
        setSelectedTrainingDetails(null);
      });
  };

  // When selectedDate or trainings update, automatically pick the last training (if exists).
  useEffect(() => {
    if (trainingsForSelectedDate.length > 0) {
      // Sort by date (and fallback to id) to choose the last training.
      const sortedTrainings = trainingsForSelectedDate.sort((a, b) => {
        const aDateTime = dayjs(`${a.date} ${a.time}`);
        const bDateTime = dayjs(`${b.date} ${b.time}`);
        const diff = aDateTime.diff(bDateTime);
        return diff !== 0 ? diff : a.id - b.id;
      });
      const lastTraining = sortedTrainings[sortedTrainings.length - 1];
      if (selectedTrainingId !== lastTraining.id) {
        fetchTrainingDetails(lastTraining.id);
      }
    } else {
      setSelectedTrainingDetails(null);
      setSelectedTrainingId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, trainings]);

  const handleSaveTraining = (newTrainingData: Partial<TrainingInterface>) => {
    console.info("Saving new training...", newTrainingData);
    createTraining(newTrainingData)
      .then(() => {
        fetchTrainings();
        setIsCreatingTraining(false);
      })
      .catch((err) => console.error(err));
  };

  // New handler to update an existing training.
  const handleUpdateTraining = (updatedTrainingData: Partial<TrainingInterface>) => {
    console.info("Updating training...", updatedTrainingData);
    updateTraining(updatedTrainingData)
      .then(() => {
        fetchTrainings();
        setIsEditingTraining(false);
        if(updatedTrainingData.id) {
          fetchTrainingDetails(updatedTrainingData.id);
        }
      })
      .catch((err) => console.error(err));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          Training Statistics
        </Typography>
        <Grid container spacing={3}>
          {/* Left Panel: Calendar, Navigation, Add Training Buttons, and Trainings List */}
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Select Date
              </Typography>
              <CustomDatePicker
                value={selectedDate}
                onChange={(newValue) => {
                  if (newValue) setSelectedDate(newValue);
                }}
              />
              <Stack direction="row" spacing={1} sx={{ mt: 2, mb: 2 }}>
                <Button variant="outlined" onClick={goToPrevTrainingDate}>
                  Previous Training
                </Button>
                <Button variant="outlined" onClick={goToNextTrainingDate}>
                  Next Training
                </Button>
              </Stack>
              <Stack spacing={2}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  fullWidth
                  onClick={handleAddTrainingNow}
                >
                  Add Training Now
                </Button>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<EventIcon />}
                  fullWidth
                  onClick={handleAddTrainingForSelectedDay}
                >
                  Add Training for Selected Day
                </Button>
              </Stack>
            </Paper>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 2 }}>
                Trainings on {selectedDate.format("DD MMM YYYY")}
              </Typography>
              {trainingsForSelectedDate.length === 0 ? (
                <Typography>No trainings for this day.</Typography>
              ) : (
                <List>
                  {trainingsForSelectedDate.map((training) => (
                    <ListItem key={training.id} disablePadding>
                      <ListItemButton
                        selected={selectedTrainingId === training.id}
                        onClick={() => fetchTrainingDetails(training.id)}
                      >
                        <ListItemText
                          primary={`${training.title} - ${dayjs(
                            `${training.date}T${training.time}`
                          ).format("HH:mm")}`}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              )}
            </Paper>
          </Grid>

          {/* Right Panel: Training Details, Create Training Form, or Edit Training Form */}
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 2 }}>
              {isCreatingTraining ? (
                <CreateTrainingForm onSave={handleSaveTraining} initialDate={selectedDate} />
              ) : isEditingTraining && selectedTrainingDetails ? (
                <CreateTrainingForm onSave={handleUpdateTraining} initialTraining={selectedTrainingDetails} />
              ) : selectedTrainingDetails ? (
                <>
                  <TrainingDetails training={selectedTrainingDetails} />
                  <Button
                    variant="contained"
                    onClick={() => setIsEditingTraining(true)}
                  >
                    Edit Training
                  </Button>
                </>
              ) : (
                <Typography variant="subtitle1">
                  Select a training to view details.
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
}
