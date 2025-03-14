import { useState, useEffect } from 'react';
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
import dayjs, { Dayjs } from 'dayjs';
// Import your API and types as needed
import { getAllTrainings } from "../api";
import CustomDatePicker from "../components/CustomDatePicker.tsx"

export interface TrainingShortInterface {
  id: number;
  date: string;
}

// Extend your training interface with additional fields.
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
  onUpdate: (updatedTraining: TrainingInterface) => void;
}
function TrainingDetails({ training, onUpdate }: TrainingDetailsProps) {
  const [localTraining, setLocalTraining] = useState(training);

  useEffect(() => {
    setLocalTraining(training);
  }, [training]);

  const handleAddSet = () => {
    const newSet = {
      id: Date.now(),
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
      if (i === setIndex) {
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
      if (i === setIndex) {
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
      if (i === setIndex) {
        const updatedExercises = s.exercises.map((ex, j) => {
          if (j === exerciseIndex) {
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

// ===== Add Training Form Component =====
//
// interface AddTrainingFormProps {
//   initialTraining: TrainingInterface;
//   onSave: (newTraining: TrainingInterface) => void;
//   onCancel: () => void;
// }
// function AddTrainingForm({ initialTraining, onSave, onCancel }: AddTrainingFormProps) {
//   const [training, setTraining] = useState(initialTraining);
//
//   const handleChange = (field: string, value: string | number) => {
//     setTraining(prev => ({ ...prev, [field]: value }));
//   };
//
//   const handleAddSet = () => {
//     const newSet = {
//       id: Date.now(),
//       exerciseType: '',
//       exercises: []
//     };
//     setTraining(prev => ({ ...prev, sets: [...prev.sets, newSet] }));
//   };
//
//   const handleAddExercise = (setIndex: number) => {
//     const newExercise = {
//       id: Date.now(),
//       repetitions: 0,
//       weight: 0,
//     };
//     const newSets = training.sets.map((s, index) => {
//       if (index === setIndex) {
//         return { ...s, exercises: [...s.exercises, newExercise] };
//       }
//       return s;
//     });
//     setTraining(prev => ({ ...prev, sets: newSets }));
//   };
//
//   const handleSetExerciseType = (setIndex: number, value: string) => {
//     const newSets = training.sets.map((s, index) => {
//       if (index === setIndex) {
//         return { ...s, exerciseType: value };
//       }
//       return s;
//     });
//     setTraining(prev => ({ ...prev, sets: newSets }));
//   };
//
//   const handleExerciseChange = (
//     setIndex: number,
//     exerciseIndex: number,
//     field: 'repetitions' | 'weight',
//     value: number
//   ) => {
//     const newSets = training.sets.map((s, i) => {
//       if (i === setIndex) {
//         const newExercises = s.exercises.map((ex, j) => {
//           if (j === exerciseIndex) {
//             return { ...ex, [field]: value };
//           }
//           return ex;
//         });
//         return { ...s, exercises: newExercises };
//       }
//       return s;
//     });
//     setTraining(prev => ({ ...prev, sets: newSets }));
//   };
//
//   return (
//     <Paper sx={{ p: 2, mt: 2 }}>
//       <Typography variant="h6" gutterBottom>
//         New Training
//       </Typography>
//       <Stack spacing={2}>
//         <TextField
//           label="Name"
//           value={training.name}
//           onChange={(e) => handleChange('name', e.target.value)}
//         />
//         <TextField
//           label="Description"
//           value={training.description}
//           onChange={(e) => handleChange('description', e.target.value)}
//         />
//         <TextField
//           label="Time"
//           type="time"
//           value={training.time}
//           onChange={(e) => handleChange('time', e.target.value)}
//           InputLabelProps={{ shrink: true }}
//         />
//         <TextField
//           label="Score"
//           type="number"
//           value={training.score}
//           onChange={(e) => handleChange('score', parseInt(e.target.value))}
//         />
//       </Stack>
//
//       <Typography variant="subtitle1" sx={{ mt: 2 }}>
//         Sets
//       </Typography>
//       {training.sets.map((set, setIndex) => (
//         <Box key={set.id} sx={{ border: '1px solid #ccc', p: 1, mt: 1 }}>
//           <TextField
//             label="Exercise Type"
//             value={set.exerciseType}
//             onChange={(e) => handleSetExerciseType(setIndex, e.target.value)}
//             size="small"
//           />
//           {set.exercises.map((exercise, exIndex) => (
//             <Box key={exercise.id} sx={{ display: 'flex', gap: 1, mt: 1 }}>
//               <TextField
//                 label="Reps"
//                 type="number"
//                 value={exercise.repetitions}
//                 onChange={(e) =>
//                   handleExerciseChange(
//                     setIndex,
//                     exIndex,
//                     'repetitions',
//                     parseInt(e.target.value)
//                   )
//                 }
//                 size="small"
//               />
//               <TextField
//                 label="Weight"
//                 type="number"
//                 value={exercise.weight}
//                 onChange={(e) =>
//                   handleExerciseChange(
//                     setIndex,
//                     exIndex,
//                     'weight',
//                     parseFloat(e.target.value)
//                   )
//                 }
//                 size="small"
//               />
//             </Box>
//           ))}
//           <Button onClick={() => handleAddExercise(setIndex)} size="small">
//             Add Exercise
//           </Button>
//         </Box>
//       ))}
//       <Button onClick={handleAddSet} sx={{ mt: 1 }} size="small">
//         Add Set
//       </Button>
//       <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
//         <Button variant="contained" onClick={() => onSave(training)}>
//           Save Training
//         </Button>
//         <Button variant="outlined" onClick={onCancel}>
//           Cancel
//         </Button>
//       </Stack>
//     </Paper>
//   );
// }

// ===== Main Training Page =====

export default function Training() {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [trainings, setTrainings] = useState<TrainingShortInterface[]>([]);
  const [addingTraining, setAddingTraining] = useState<TrainingInterface | null>(null);

  useEffect(() => {
    getAllTrainings()
      .then((data: TrainingShortInterface[]) => {
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
    setAddingTraining({
      id: Date.now(),
      date: dayjs().format('YYYY-MM-DD'),
      name: '',
      title: '',
      description: '',
      time: dayjs().format('HH:mm'),
      score: 0,
      duration: "0", // changed from number to string
      quantity_exercises: "0", // changed from number to string
      max_weight: 0,
      max_repetitions: 0,
      sets: []
    });
  };

  const handleAddTrainingForSelectedDay = () => {
    setAddingTraining({
      id: Date.now(),
      date: selectedDate.format('YYYY-MM-DD'),
      name: '',
      title: '',
      description: '',
      time: '00:00',
      score: 0,
      duration: "0", // changed from number to string
      quantity_exercises: "0", // changed from number to string
      max_weight: 0,
      max_repetitions: 0,
      sets: []
    });
  };


  // Add new training to the list.
  const handleSaveTraining = (newTraining: TrainingInterface) => {
    setTrainings(prev => [...prev, newTraining]);
    setAddingTraining(null);
  };

  // Filter the trainings for the selected day.
  const trainingsForSelectedDate = trainings.filter(t =>
    dayjs(t.date).isSame(selectedDate, 'day')
  );

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
            {/* Show the add training form if addingTraining is not null */}
            {addingTraining && (
              <AddTrainingForm
                initialTraining={addingTraining}
                onSave={handleSaveTraining}
                onCancel={() => setAddingTraining(null)}
              />
            )}
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
