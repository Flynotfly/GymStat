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
            Set {set.index} - Type: {set.exerciseType}
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

  const handleAddTrainingNow = () => {
    console.info('Handle add Training now');
  };

  const handleAddTrainingForSelectedDay = () => {
    console.info('Handle add Training for selected day');
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
        const diff = dayjs(a.date).diff(dayjs(b.date));
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
        {/* Left Panel: Date Picker, Navigation & Add Training */}
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
              <>
                {/* Trainings list */}
                <List>
                  {trainingsForSelectedDate.map((training) => (
                    <ListItem key={training.id} disablePadding>
                      <ListItemButton
                        selected={selectedTrainingId === training.id}
                        onClick={() => fetchTrainingDetails(training.id)}
                      >
                        <ListItemText primary={`${training.title} - ${dayjs(`${training.date}T${training.time}`).format('HH:mm')}`} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
                {/* Training details */}
                {selectedTrainingDetails && (
                  <TrainingDetails training={selectedTrainingDetails} />
                )}
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
