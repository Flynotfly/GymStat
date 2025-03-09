import {useState, SyntheticEvent, useEffect} from "react";
import {
  Box,
  Button,
  Tabs,
  Tab,
  Typography,
  Tooltip,
  IconButton,
  Dialog,
  Paper,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {createExercise, fetchCsrf, getBaseExercises, getUserExercises} from "../api.ts";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import DialogActions from "@mui/material/DialogActions";

interface Exercise {
  id: number;
  name: string;
  description: string;
  iconId: number;
  iconColor: string;
}

// Define props for the ExerciseCard component
interface ExerciseCardProps {
  exercise: Exercise;
  isUserExercise: boolean;
  onEdit: (exercise: Exercise) => void;
  onDelete: (exercise: Exercise) => void;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
                                                     exercise,
                                                     isUserExercise,
                                                     onEdit,
                                                     onDelete,
                                                   }) => {
  // Define icon styles based on shape and color
  const iconStyles = {
    width: 40,
    height: 40,
    backgroundColor: exercise.iconColor,
    borderRadius: "4px",
    mr: 2,
  };

  return (
    <Paper elevation={2} sx={{ display: "flex", alignItems: "center", p: 1, mb: 1 }}>
      {/* Wrap icon and name in a Tooltip to show description on hover */}
      <Tooltip title={exercise.description} arrow>
        <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
          <Box sx={iconStyles} />
          <Typography variant="subtitle1">{exercise.name}</Typography>
        </Box>
      </Tooltip>
      {/* Only show edit and delete buttons for user's exercises */}
      {isUserExercise && (
        <Box>
          <IconButton size="small" onClick={() => onEdit(exercise)}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => onDelete(exercise)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
    </Paper>
  );
};

export default function Exercises() {
  const [tab, setTab] = useState<number>(0);
  const [userExercises, setUserExercises] = useState<Exercise[]>([]);
  const [baseExercises, setBaseExercises] = useState<Exercise[]>([]);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [loadingBase, setLoadingBase] = useState<boolean>(true);
  const [open, setOpen] = useState<boolean>(false);
  const [newExercise, setNewExercise] = useState({
    name: "",
    description: "",
    iconId: 0,
    iconColor: "#000000",
  });

  useEffect(() => {
    fetchCsrf().catch(console.error);
  }, []);

  useEffect(() => {
    getUserExercises()
      .then(data => {
        setUserExercises(data);
        console.log("User's exercises: ", data);
      })
      .catch(err => console.log("Error fetching user's exercises: ", err))
      .finally(() => setLoadingUser(false));
  }, []);

  useEffect(() => {
    getBaseExercises()
      .then(data => {
        setBaseExercises(data);
        console.log("Base exercises: ", data);
      })
      .catch(err => console.log("Error fetching base exercises: ", err))
      .finally(() => setLoadingBase(false));
  }, []);

  const handleTabChange = (_event: SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  // Placeholder handlers for edit and delete actions with type annotations
  const handleEdit = (exercise: Exercise) => {
    console.log("Edit exercise", exercise);
  };

  const handleDelete = (exercise: Exercise) => {
    console.log("Delete exercise", exercise);
  };

  const handleOpenDialog = () => {
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    // Optionally clear form fields
    setNewExercise({ name: "", description: "", iconId: 0, iconColor: "#000000" });
  };

  // Handler for creating a new exercise
  const handleCreate = () => {
    console.log("Creating new exercise:", newExercise);
    createExercise(newExercise)
      .then()
      .catch((err) => console.error(err))
      .finally(() => handleCloseDialog());
  };

  // Determine which list of exercises to show based on the selected tab
  const exercisesToShow: Exercise[] = tab === 0 ? userExercises : baseExercises;
  const isLoading: boolean = tab === 0 ? loadingUser : loadingBase;

  return (
    <Box sx={{ p: 2 }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Exercises
      </Typography>
      <Button variant="contained" onClick={handleOpenDialog} sx={{ mb: 2}}>
        Create New Exercise
      </Button>
      <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="User's Exercises" />
        <Tab label="Base Exercises" />
      </Tabs>
      <Box>
        {isLoading ? (
          <Box>Loading...</Box>
        ) : exercisesToShow.length === 0 ? (
          <Box>No exercises available</Box>
        ) : (
          exercisesToShow.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              isUserExercise={tab === 0}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </Box>

      {/* Create New Exercise Dialog */}
      <Dialog
        open={open}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Create New Exercise</DialogTitle>
        <DialogContent sx={{ gap: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newExercise.name}
            onChange={(e) =>
              setNewExercise({ ...newExercise, name: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            value={newExercise.description}
            onChange={(e) =>
              setNewExercise({ ...newExercise, description: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Icon Color"
            type="text"
            fullWidth
            variant="outlined"
            value={newExercise.iconColor}
            onChange={(e) =>
              setNewExercise({ ...newExercise, iconColor: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Icon ID"
            type="number"
            fullWidth
            variant="outlined"
            value={newExercise.iconId}
            onChange={(e) =>
              setNewExercise({ ...newExercise, iconId: parseInt(e.target.value) || 0 })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleCreate}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
