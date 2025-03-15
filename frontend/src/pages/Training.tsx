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

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';

// Import your API and types as needed
import { getAllTrainings, getTraining } from "../api";
import CustomDatePicker from "../components/CustomDatePicker.tsx";

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

// ===== AddTrainingForm Component =====
interface AddTrainingFormProps {
  open: boolean;
  handleClose: () => void;
  onSubmit: (training: TrainingInterface) => void;
  initialDate?: Dayjs;
}

function AddTrainingForm({ open, handleClose, onSubmit, initialDate }: AddTrainingFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Dayjs>(initialDate || dayjs());
  const [time, setTime] = useState('');
  const [score, setScore] = useState<number>(0);

  useEffect(() => {
    if (initialDate) {
      setDate(initialDate);
    }
  }, [initialDate]);

  const handleSubmit = () => {
    const newTraining: TrainingInterface = {
      id: Date.now(), // Temporary ID. Replace with your actual ID logic if needed.
      title,
      description,
      date: date.format('YYYY-MM-DD'),
      time,
      score,
      sets: [] // New training starts with no sets.
    };
    onSubmit(newTraining);
    // Reset the form fields.
    setTitle('');
    setDescription('');
    setDate(dayjs());
    setTime('');
    setScore(0);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Add New Training</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Fill out the details for the new training.
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          label="Title"
          fullWidth
          variant="outlined"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Description"
          fullWidth
          variant="outlined"
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <CustomDatePicker
          value={date}
          onChange={(newValue) => {
            if (newValue) setDate(newValue);
          }}
        />
        <TextField
          margin="dense"
          label="Time"
          fullWidth
          variant="outlined"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          placeholder="HH:mm"
        />
        <TextField
          margin="dense"
          label="Score"
          fullWidth
          variant="outlined"
          type="number"
          value={score}
          onChange={(e) => setScore(Number(e.target.value))}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Add Training
        </Button>
      </DialogActions>
    </Dialog>
  );
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

// ===== Main Training Page =====

export default function Training() {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [trainings, setTrainings] = useState<TrainingShortInterface[]>([]);
  const [selectedTrainingDetails, setSelectedTrainingDetails] = useState<TrainingInterface | null>(null);
  const [selectedTrainingId, setSelectedTrainingId] = useState<number | null>(null);
  const [openAddForm, setOpenAddForm] = useState(false);
  const [initialTrainingDate, setInitialTrainingDate] = useState<Dayjs>(dayjs());

  // Fetch all trainings on mount.
  useEffect(() => {
    getAllTrainings()
      .then((data: TrainingShortInterface[]) => {
        setTrainings(data);
        console.log('trainings: ', data);
      })
      .catch(err => console.log("Error fetching trainings: ", err));
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

  // Open the add training form with the appropriate initial date.
  const handleAddTrainingNow = () => {
    setInitialTrainingDate(dayjs());
    setOpenAddForm(true);
  };

  const handleAddTrainingForSelectedDay = () => {
    setInitialTrainingDate(selectedDate);
    setOpenAddForm(true);
  };

  // Handle new training submission.
  const handleNewTrainingSubmit = (newTraining: TrainingInterface) => {
    setTrainings([...trainings, newTraining]);
    console.log("New training added: ", newTraining);
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

  return (
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

        {/* Right Panel: Training Details */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 2 }}>
            {selectedTrainingDetails ? (
              <TrainingDetails training={selectedTrainingDetails} />
            ) : (
              <Typography variant="subtitle1">
                Select a training to view details.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
      {/* Render the AddTrainingForm modal */}
      <AddTrainingForm
        open={openAddForm}
        handleClose={() => setOpenAddForm(false)}
        onSubmit={handleNewTrainingSubmit}
        initialDate={initialTrainingDate}
      />
    </Box>
  );
}
