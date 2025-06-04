// src/pages/NewTrainingPage.tsx
import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";
import { useNavigate } from "react-router-dom";
import { createTraining } from "../../api.ts";
import { NewTrainingStringify } from "../../types/training";

export default function NewTrainingPage() {
  const navigate = useNavigate();

  // State for the three fields: conducted, title, description
  const [conducted, setConducted] = useState<Dayjs | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Enable submission only when conducted date is chosen and title is non-empty
  const canSubmit = conducted !== null && title.trim() !== "";

  const handleSubmit = () => {
    if (!canSubmit || !conducted) return;

    const payload: NewTrainingStringify = {
      conducted: conducted.toISOString(),
      title: title.trim(),
      description: description.trim(),
      // Since we're only handling these three fields for now, set notes and exercises to empty arrays
      notes: [],
      exercises: [],
    };

    createTraining(payload)
      .then(() => {
        // After successful creation, navigate back to the trainings list
        navigate("/app/trainings");
      })
      .catch((err) => {
        console.error("Error creating training:", err);
      });
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Add New Training
      </Typography>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label="Conducted Date"
          value={conducted}
          onChange={(newValue: Dayjs | null) => setConducted(newValue)}
          slotProps={{
            textField: { fullWidth: true, sx: { mb: 2 } },
          }}
        />
      </LocalizationProvider>

      <TextField
        fullWidth
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
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

      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={!canSubmit}
      >
        Create Training
      </Button>
    </Box>
  );
}
