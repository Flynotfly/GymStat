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
  Chip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
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
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {training.description}
                </Typography>
              )}

              {/* NOTES */}
              {training.notes.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Notes:
                  </Typography>
                  <Grid container spacing={1}>
                    {training.notes.map((note, i) => (
                      <Grid item xs={12} sm={6} key={i}>
                        <Paper variant="outlined" sx={{ p: 1 }}>
                          <Typography variant="body2">
                            <strong>Name:</strong> {note.Name}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Field:</strong> {note.Field}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Required:</strong>{" "}
                            {note.Required === "True" ? "Yes" : "No"}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Value:</strong> {note.Value}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* EXERCISES */}
              {training.exercises.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Exercises:
                  </Typography>
                  {training.exercises.map((ex, ei) => {
                    // Determine all set keys for table header
                    const setKeys = ex.sets
                      ? Array.from(
                        new Set(
                          ex.sets.flatMap(s => Object.keys(s))
                        )
                      )
                      : [];
                    return (
                      <Box key={ei} sx={{ mb: 2 }}>
                        <Typography variant="body2" gutterBottom>
                          <strong>Template ID:</strong> {ex.template}
                        </Typography>

                        {/* Units */}
                        {ex.units && (
                          <Box sx={{ mb: 1 }}>
                            {Object.entries(ex.units).map(
                              ([k, v]) => (
                                <Chip
                                  key={k}
                                  label={`${k}: ${v}`}
                                  size="small"
                                  sx={{ mr: 0.5, mb: 0.5 }}
                                />
                              )
                            )}
                          </Box>
                        )}

                        {/* Sets table */}
                        {ex.sets && ex.sets.length > 0 && (
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                {setKeys.map(key => (
                                  <TableCell key={key}>
                                    {key}
                                  </TableCell>
                                ))}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {ex.sets.map((set, si) => (
                                <TableRow key={si}>
                                  {setKeys.map(key => (
                                    <TableCell key={key}>
                                      {set[key] ?? "-"}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </Box>
                    );
                  })}
                </Box>
              )}
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
