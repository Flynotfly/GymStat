import React, { useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Tooltip,
  IconButton,
  Paper,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

// Dummy exercise data
const userExercises = [
  {
    id: 1,
    name: "Push Ups",
    description: "Do 20 push ups",
    icon: { shape: "circle", color: "primary.main" },
  },
  {
    id: 2,
    name: "Squats",
    description: "Do 30 squats",
    icon: { shape: "square", color: "secondary.main" },
  },
];

const baseExercises = [
  {
    id: 3,
    name: "Running",
    description: "Run 5 km",
    icon: { shape: "circle", color: "info.main" },
  },
  {
    id: 4,
    name: "Cycling",
    description: "Cycle 10 km",
    icon: { shape: "square", color: "success.main" },
  },
];

// Component for each exercise card
const ExerciseCard = ({ exercise, isUserExercise, onEdit, onDelete }) => {
  // Define icon styles based on shape and color
  const iconStyles = {
    width: 40,
    height: 40,
    backgroundColor: exercise.icon.color,
    borderRadius: exercise.icon.shape === "circle" ? "50%" : "4px",
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
  const [tab, setTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  // Placeholder handlers for edit and delete actions
  const handleEdit = (exercise) => {
    console.log("Edit exercise", exercise);
  };

  const handleDelete = (exercise) => {
    console.log("Delete exercise", exercise);
  };

  // Determine which list of exercises to show based on the selected tab
  const exercisesToShow = tab === 0 ? userExercises : baseExercises;

  return (
    <Box sx={{ p: 2 }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Exercises
      </Typography>
      <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="User's Exercises" />
        <Tab label="Base Exercises" />
      </Tabs>
      <Box>
        {exercisesToShow.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            isUserExercise={tab === 0}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </Box>
    </Box>
  );
}
