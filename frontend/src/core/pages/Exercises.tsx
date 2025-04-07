import { useState, useEffect, SyntheticEvent } from "react";
import {
  Box,
  Button,
  Tabs,
  Tab,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  Snackbar,
  Alert,
  Grid,
} from "@mui/material";
import ExerciseCard from "../components/ExerciseCard.tsx";
import {fetchCsrf} from "../api/lib.ts";
import {createExercise, getBaseExercises, getUserExercises} from "../../training/api.ts";

export interface Exercise {
  id: number;
  name: string;
  description: string;
  iconId: number | "";
  iconColor: string;
}

export default function Exercises() {
  const [tab, setTab] = useState<number>(0);
  const [userExercises, setUserExercises] = useState<Exercise[]>([]);
  const [baseExercises, setBaseExercises] = useState<Exercise[]>([]);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [loadingBase, setLoadingBase] = useState<boolean>(true);
  const [open, setOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [newExercise, setNewExercise] = useState<Exercise>({
    id: 0,
    name: "",
    description: "",
    iconId: "",
    iconColor: "#000000",
  });

  // Fetch CSRF token (if needed) on mount
  useEffect(() => {
    fetchCsrf().catch(console.error);
  }, []);

  const loadUserExercises = () => {
    setLoadingUser(true);
    getUserExercises()
      .then(data => setUserExercises(data))
      .catch(err => console.error("Error fetching user's exercises:", err))
      .finally(() => setLoadingUser(false));
  };

  useEffect(() => {
    loadUserExercises();
  }, []);

  useEffect(() => {
    setLoadingBase(true);
    getBaseExercises()
      .then(data => setBaseExercises(data))
      .catch(err => console.error("Error fetching base exercises:", err))
      .finally(() => setLoadingBase(false));
  }, []);

  const handleTabChange = (_event: SyntheticEvent, newValue: number) => {
    setTab(newValue);
  };

  const handleOpenDialog = () => {
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setNewExercise({ id: 0, name: "", description: "", iconId: "", iconColor: "#000000" });
  };

  const handleCreate = async () => {
    try {
      if (!newExercise.name.trim()) {
        setError("Name is required!");
        return;
      }

      const formattedExercise = {
        ...newExercise,
        iconId: newExercise.iconId === "" ? 0 : newExercise.iconId, // Ensure valid number
      };

      await createExercise(formattedExercise);
      setSuccessMessage("Exercise created successfully!");
      handleCloseDialog();
      loadUserExercises(); // Reload exercises
    } catch (err) {
      setError("Failed to create exercise. Please try again.");
      console.error("Create error:", err);
    }
  };

  const exercisesToShow = tab === 0 ? userExercises : baseExercises;

  return (
    <Box sx={{ p: 2 }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Exercises
      </Typography>
      <Button variant="contained" onClick={handleOpenDialog} sx={{ mb: 2 }}>
        Create New Exercise
      </Button>
      <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="User's Exercises" />
        <Tab label="Base Exercises" />
      </Tabs>
      { (tab === 0 && loadingUser) || (tab === 1 && loadingBase) ? (
        <Box>Loading...</Box>
      ) : (
        <Grid container spacing={2}>
          {exercisesToShow.map((exercise) => (
            <Grid item xs={12} sm={6} md={4} key={exercise.id}>
              <ExerciseCard
                name={exercise.name}
                description={exercise.description}
                iconId={exercise.iconId}
                iconColor={exercise.iconColor}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create New Exercise Dialog */}
      <Dialog open={open} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>Create New Exercise</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              autoFocus
              label="Name"
              type="text"
              fullWidth
              variant="outlined"
              value={newExercise.name}
              onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
            />
            <TextField
              label="Description"
              type="text"
              fullWidth
              variant="outlined"
              value={newExercise.description}
              onChange={(e) => setNewExercise({ ...newExercise, description: e.target.value })}
            />
            <TextField
              label="Icon Color"
              type="text"
              fullWidth
              variant="outlined"
              value={newExercise.iconColor}
              onChange={(e) => setNewExercise({ ...newExercise, iconColor: e.target.value })}
            />
            <TextField
              label="Icon ID"
              type="number"
              fullWidth
              variant="outlined"
              value={newExercise.iconId}
              onChange={(e) => {
                const value = e.target.value;
                setNewExercise({ ...newExercise, iconId: value === "" ? "" : parseInt(value) || 0 });
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleCreate}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Error Message Snackbar */}
      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>

      {/* Success Message Snackbar */}
      <Snackbar open={!!successMessage} autoHideDuration={3000} onClose={() => setSuccessMessage(null)}>
        <Alert severity="success" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
