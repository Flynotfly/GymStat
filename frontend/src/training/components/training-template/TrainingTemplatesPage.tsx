// src/components/TrainingTemplatesPage.tsx
import {
  Box,
  Typography,
  Button,
  Card,
  CardHeader,
  CardContent,
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
import { getTrainingTemplates } from "../../api.ts";
import { TrainingTemplate } from "../../types/trainingTemplate";

export default function TrainingTemplatesPage() {
  const [templates, setTemplates] = useState<TrainingTemplate[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchTemplates = (pg: number, append = false) => {
    setLoading(true);
    getTrainingTemplates(pg)
      .then(({ results, next }) => {
        setTemplates(prev => (append ? [...prev, ...results] : results));
        setPage(pg + 1);
        setHasMore(Boolean(next));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchTemplates(1, false); }, []);

  useEffect(() => {
    if (loading) return;
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        fetchTemplates(page, true);
      }
    }, { threshold: 1 });
    const el = loadMoreRef.current;
    if (el) obs.observe(el);
    return () => { if (el) obs.unobserve(el); };
  }, [page, hasMore, loading]);

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
        <Button
          variant="contained"
          onClick={() => navigate("/app/trainings/templates/add")}
        >
          Add New Template
        </Button>
      </Box>

      {templates.length === 0 && !loading ? (
        <Typography sx={{ textAlign: "center", mt: 4 }}>
          No training templates found.
        </Typography>
      ) : (
        templates.map((tpl) => (
          <Card variant="outlined" sx={{ mb: 2 }} key={tpl.id}>
            <CardHeader
              title={tpl.name}
              subheader={tpl.description}
            />
            <CardContent>
              {/* NOTES */}
              {tpl.data.Notes?.length ? (
                <Box mb={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Notes
                  </Typography>
                  <Grid container spacing={1}>
                    {tpl.data.Notes.map((note, i) => (
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
                            {note.Required ? "Yes" : "No"}
                          </Typography>
                          {note.Default && (
                            <Typography variant="body2">
                              <strong>Default:</strong> {note.Default}
                            </Typography>
                          )}
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ) : null}

              {/* EXERCISES */}
              {tpl.data.Exercises?.length ? (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Exercises
                  </Typography>
                  {tpl.data.Exercises.map((ex, ei) => {
                    const setKeys = ex.Sets
                      ? Array.from(
                        new Set(
                          ex.Sets.flatMap((s) => Object.keys(s))
                        )
                      )
                      : [];
                    return (
                      <Box key={ei} sx={{ mb: 2 }}>
                        <Typography variant="body2" gutterBottom>
                          <strong>Template ID:</strong> {ex.Template}
                        </Typography>

                        {/* Units */}
                        {ex.Unit && (
                          <Box sx={{ mb: 1 }}>
                            {Object.entries(ex.Unit).map(([k, v]) => (
                              <Chip
                                key={k}
                                label={`${k}: ${v}`}
                                size="small"
                                sx={{ mr: 0.5, mb: 0.5 }}
                              />
                            ))}
                          </Box>
                        )}

                        {/* Sets table */}
                        {ex.Sets && ex.Sets.length > 0 && (
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                {setKeys.map((key) => (
                                  <TableCell key={key}>{key}</TableCell>
                                ))}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {ex.Sets.map((set, si) => (
                                <TableRow key={si}>
                                  {setKeys.map((key) => (
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
              ) : null}
            </CardContent>
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
