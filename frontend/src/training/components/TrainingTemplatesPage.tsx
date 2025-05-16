// src/components/TrainingTemplatesPage.tsx
import {
  Box,
  Typography,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTrainingTemplates } from "../api";
import { TrainingTemplate } from "../types/trainingTemplate";

export default function TrainingTemplatesPage() {
  const [templates, setTemplates] = useState<TrainingTemplate[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    getTrainingTemplates()
      .then((data) => {
        setTemplates(data);
      })
      .catch((err) => console.error("Error fetching training templates:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = () => {
    navigate("/training-templates/new");
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography component="h2" variant="h6">
          Training Templates
        </Typography>
        <Button variant="contained" onClick={handleAdd}>
          Add New Template
        </Button>
      </Box>

      {loading ? (
        <Typography sx={{ textAlign: "center" }}>Loading...</Typography>
      ) : templates.length === 0 ? (
        <Typography sx={{ textAlign: "center", mt: 4 }}>
          No training templates found.
        </Typography>
      ) : (
        templates.map((tpl) => (
          <Accordion key={tpl.id} TransitionProps={{ unmountOnExit: true }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{tpl.name}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="subtitle2" gutterBottom>
                Description
              </Typography>
              <Typography paragraph>{tpl.description}</Typography>

              <Typography variant="subtitle2" gutterBottom>
                Data
              </Typography>
              <Box
                component="pre"
                sx={{
                  bgcolor: "#f5f5f5",
                  p: 1,
                  borderRadius: 1,
                  overflowX: "auto",
                  fontSize: "0.875rem",
                }}
              >
                {JSON.stringify(tpl.data, null, 2)}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Box>
  );
}
