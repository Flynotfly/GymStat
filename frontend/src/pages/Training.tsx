import React, { useState, useEffect } from 'react';
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import TextField from '@mui/material/TextField';
import AddIcon from '@mui/icons-material/Add';
import EventIcon from '@mui/icons-material/Event';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import dayjs, { Dayjs } from 'dayjs';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// Import your API and types as needed
import { getAllTrainings } from "../api";
import { TrainingInterface } from "../dashboard/internals/data/gridDataMy";

// Extend your training interface to include the needed properties.
interface TrainingInterfaceExtended extends TrainingInterface {
  date: string;
  name: string;
  description: string;
  time: string;
  score: number;
  sets: {
    id: number;
    exerciseType: string;
    exercises: {
      id: number;
      repetitions: number;
      weight: number;
    }[]
  }[]
}

// ===== Custom DatePicker Components =====

// A custom button field that will be used as the trigger for the DatePicker pop-up.
interface ButtonFieldProps {
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  label?: string;
  id?: string;
  disabled?: boolean;
  inputProps?: any;
}

function ButtonField(props: ButtonFieldProps) {
  const { setOpen, label, id, disabled } = props;
  return (
    <Button
      variant="outlined"
      id={id}
      disabled={disabled}
      size="small"
      onClick={() => setOpen && setOpen(prev => !prev)}
      startIcon={<CalendarTodayRoundedIcon fontSize="small" />}
      sx={{ minWidth: 'fit-content' }}
    >
      {label ? label : 'Pick a date'}
    </Button>
  );
}

// A controlled custom date picker that accepts value and onChange.
interface CustomDatePickerProps {
  value: Dayjs;
  onChange: (newValue: Dayjs | null) => void;
}

function CustomDatePicker({ value, onChange }: CustomDatePickerProps) {
  const [open, setOpen] = useState(false);
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        value={value}
        onChange={onChange}
        slots={{ field: ButtonField }}
        slotProps={{
          field: { setOpen } as any,
          nextIconButton: { size: 'small' },
          previousIconButton: { size: 'small' },
        }}
        open={open}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        views={['day', 'month', 'year']}
      />
    </LocalizationProvider>
  );
}

// ===== Training Details Component =====

interface TrainingDetailsProps {
  training: TrainingInterfaceExtended;
  onUpdate: (updatedTraining: TrainingInterfaceExtended) => void;
}

function TrainingDetails({ training, onUpdate }: TrainingDetailsProps) {
  const [localTraining, setLocalTraining] = useState(training);

  useEffect(() => {
    setLocalTraining(training);
  }, [training]);

  const handleAddSet = () => {
    const newSet = {
      id: Date.now(), // dummy id; in production, use a better id scheme
      exerciseType: '',
      exercises: []
    };
    const updatedTraining = {
      ...localTraining,
      sets: [...localTraining.sets, newSet]
    };
    setLocalTraining(updatedTraining);
    onUpdate(updatedTraining);
  };

  const handleAddExercise = (setIndex: number) => {
    const newExercise = {
      id: Date.now(),
      repetitions: 0,
      weight: 0
    };
    const updatedSets = localTraining.sets.map((s, i) => {
      if(i === setIndex) {
        return { ...s, exercises: [...s.exercises, newExercise] };
      }
      return s;
    });
    const updatedTraining = { ...localTraining, sets: updatedSets };
    setLocalTraining(updatedTraining);
    onUpdate(updatedTraining);
  };

  const handleExerciseTypeChange = (setIndex: number, newType: string) => {
    const updatedSets = localTraining.sets.map((s, i) => {
      if(i === setIndex) {
        return { ...s, exerciseType: newType };
      }
      return s;
    });
    const updatedTraining = { ...localTraining, sets: updatedSets };
    setLocalTraining(updatedTraining);
    onUpdate(updatedTraining);
  };

  const handleExerciseChange = (
    setIndex: number,
    exerciseIndex: number,
    field: 'repetitions' | 'weight',
    value: number
  ) => {
    const updatedSets = localTraining.sets.map((s, i) => {
      if(i === setIndex) {
        const updatedExercises = s.exercises.map((ex, j) => {
          if(j === exerciseIndex) {
            return { ...ex, [field]: value };
          }
          return ex;
        });
        return { ...s, exercises: updatedExercises };
      }
      return s;
    });
    const updatedTraining = { ...localTraining, sets: updatedSets };
    setLocalTraining(updatedTraining);
    onUpdate(updatedTraining);
  };

  return (
    <Box sx={{ border: '1px solid #ccc', p: 2, mb: 2 }}>
      <Typography variant="h6">{localTraining.name}</Typography>
      <Typography variant="body2">{localTraining.description}</Typography>
      <Typography variant="body2">Time: {localTraining.time}</Typography>
      <Typography variant="body2">Score: {localTraining.score}</Typography>
      <Divider sx={{ my: 1 }} />
      {localTraining.sets.map((set, setIndex) => (
        <Box key={set.id} sx={{ mb: 1, p: 1, border: '1px solid #eee' }}>
          <TextField
            label="Exercise Type"
            value={set.exerciseType}
            onChange={(e) => handleExerciseTypeChange(setIndex, e.target.value)}
            size="small"
            sx={{ mb: 1 }}
          />
          {set.exercises.map((exercise, exIndex) => (
            <Box
              key={exercise.id}
              sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}
            >
              <TextField
                label="Reps"
                type="number"
                value={exercise.repetitions}
                onChange={(e) =>
                  handleExerciseChange(
                    setIndex,
                    exIndex,
                    'repetitions',
                    parseInt(e.target.value)
                  )
                }
                size="small"
                sx={{ width: '80px' }}
              />
              <TextField
                label="Weight"
                type="number"
                value={exercise.weight}
                onChange={(e) =>
                  handleExerciseChange(
                    setIndex,
                    exIndex,
                    'weight',
                    parseFloat(e.target.value)
                  )
                }
                size="small"
                sx={{ width: '80px' }}
              />
            </Box>
          ))}
          <Button size="small" onClick={() => handleAddExercise(setIndex)}>
            Add Exercise
          </Button>
        </Box>
      ))}
      <Button size="small" onClick={handleAddSet}>
        Add Set
      </Button>
    </Box>
  );
}

// ===== Main Training Page =====

export default function Training() {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [trainings, setTrainings] = useState<TrainingInterfaceExtended[]>([]);

  useEffect(() => {
    getAllTrainings()
      .then((data: TrainingInterfaceExtended[]) => {
        setTrainings(data);
        console.log('trainings: ', data);
      })
      .catch(err => console.log("Error fetching trainings: ", err));
  }, []);

  // Navigate to the next training date (if none, default to today)
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

  // Navigate to the previous training date (if none, default to today)
  const goToPrevTrainingDate = () => {
    const dates = trainings
      .map(t => dayjs(t.date))
      .filter(d => d.isBefore(selectedDate, 'day'));
    dates.sort((a, b) => b.diff(a));
    if (dates.length > 0) {
      setSelectedDate(dates[0]);
    } else {
      setSelectedDate(dayjs());
    }
  };

  const handleAddTrainingNow = () => {
    // Add your logic to create a training record for the current date/time.
    console.log("Add training now");
  };

  const handleAddTrainingForSelectedDay = () => {
    // Add your logic to create a training record for the selected date.
    console.log("Add training for: ", selectedDate.format());
  };

  // Filter the trainings that match the selected day.
  const trainingsForSelectedDate = trainings.filter(t =>
    dayjs(t.date).isSame(selectedDate, 'day')
  );

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
        Training Statistics
      </Typography>
      <Grid container spacing={3}>
        {/* Left Panel: Date Picker and Navigation */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 2 }}>
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
        </Grid>

        {/* Right Panel: Trainings List and Details */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Trainings on {selectedDate.format('DD MMM YYYY')}
            </Typography>
            {trainingsForSelectedDate.length === 0 ? (
              <Typography>No trainings for this day.</Typography>
            ) : (
              trainingsForSelectedDate.map(training => (
                <TrainingDetails
                  key={training.id}
                  training={training}
                  onUpdate={(updatedTraining) => {
                    setTrainings(prev =>
                      prev.map(t =>
                        t.id === updatedTraining.id ? updatedTraining : t
                      )
                    );
                  }}
                />
              ))
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
