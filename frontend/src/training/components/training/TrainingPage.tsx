// src/pages/TrainingPage.tsx
import {
  Box,
  Typography,
  Button,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  IconButton,
  Grid,
  Paper,
} from "@mui/material";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  getTrainings,
  deleteTraining,
} from "../../api.ts";
import { TrainingStringify } from "../../types/training";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function TrainingPage() {
  const [trainings, setTrainings] = useState<TrainingStringify[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchTrainings = (pg: number, append = false) => {
    setLoading(true);
    getTrainings(pg)
      .then(({ results, next }) => {
        setTrainings(prev =>
          append ? [...prev, ...results] : results
        );
        setPage(pg + 1);
        setHasMore(Boolean(next));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTrainings(1, false);
  }, []);

  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(entries => {
      if (
        entries[0].isIntersecting &&
        hasMore &&
        !loading
      ) {
        fetchTrainings(page, true);
      }
    }, { threshold: 1 });
    const el = loadMoreRef.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [page, hasMore, loading]);

  const handleDelete = (id: number) => {
    deleteTraining(id)
      .then(() => {
        setTrainings(prev =>
          prev.filter(t => t.id !== id)
        );
      })
      .catch(err => {
        console.error("Error deleting training:", err);
      });
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
          Trainings
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/app/trainings/add")}
        >
          Add New Training
        </Button>
      </Box>

      {trainings.length === 0 && !loading ? (
        <Typography sx={{ textAlign: "center", mt: 4 }}>
          No trainings found.
        </Typography>
      ) : (
        trainings.map(training => (
          <Card variant="outlined" sx={{ mb: 2 }} key={training.id}>
            <CardHeader
              title={training.title || "Untitled Training"}
              subheader={
                new Date(training.conducted).toLocaleString()
              }
            />
            <CardContent>
              {training.description && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {training.description}
                </Typography>
              )}
              <Grid container spacing={1}>
                <Grid item>
                  <Paper
                    variant="outlined"
                    sx={{ p: 1, textAlign: "center" }}
                  >
                    <Typography variant="subtitle2">
                      Notes
                    </Typography>
                    <Typography variant="h6">
                      {training.notes.length}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item>
                  <Paper
                    variant="outlined"
                    sx={{ p: 1, textAlign: "center" }}
                  >
                    <Typography variant="subtitle2">
                      Exercises
                    </Typography>
                    <Typography variant="h6">
                      {training.exercises.length}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
            <CardActions>
              <IconButton
                aria-label="edit"
                onClick={() =>
                  navigate(`/app/trainings/edit/${training.id}`)
                }
              >
                <EditIcon />
              </IconButton>
              <IconButton
                aria-label="delete"
                onClick={() => handleDelete(training.id)}
              >
                <DeleteIcon />
              </IconButton>
            </CardActions>
          </Card>
        ))
      )}

      {loading && (
        <Typography sx={{ textAlign: "center", mt: 2 }}>
          Loading more…
        </Typography>
      )}
      <div ref={loadMoreRef} />
    </Box>
  );
}
