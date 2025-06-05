// src/pages/NewTrainingPage.tsx
import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import {
  DateTimePicker,
  LocalizationProvider,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Dayjs } from "dayjs";
import { useNavigate } from "react-router-dom";
import { createTraining } from "../../api.ts";
import { NewTrainingStringify } from "../../types/training";

export default function NewTrainingPage() {
  const navigate = useNavigate();

  const [conducted, setConducted] = useState<Dayjs | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const canSubmit = conducted !== null;

  const handleSubmit = () => {
    if (!canSubmit || !conducted) return;

    const payload: NewTrainingStringify = {
      conducted: conducted.toISOString(),
      title: title.trim() || "",
      description: description.trim(),
      notes: [],
      exercises: [],
    };

    createTraining(payload)
      .then(() => {
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
        <DateTimePicker
          label="Conducted"
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
