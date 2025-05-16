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
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getTrainingTemplates } from "../api"; // should accept a page number and return { results: TrainingTemplate[], next: boolean | string | null }
import { TrainingTemplate } from "../types/trainingTemplate";

export default function TrainingTemplatesPage() {
  const [templates, setTemplates] = useState<TrainingTemplate[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchTemplates = (pageToFetch: number, append = false) => {
    setLoading(true);
    getTrainingTemplates(pageToFetch)
      .then(({ results, next }) => {
        setTemplates(prev =>
          append ? [...prev, ...results] : results
        );
        setPage(pageToFetch + 1);
        setHasMore(Boolean(next));
      })
      .catch(err => console.error("Error fetching training templates:", err))
      .finally(() => setLoading(false));
  };

  // initial load
  useEffect(() => {
    fetchTemplates(1, false);
  }, []);

  // infinite scroll
  useEffect(() => {
    if (loading) return;
    const obs = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchTemplates(page, true);
        }
      },
      { threshold: 1 }
    );
    const el = loadMoreRef.current;
    if (el) obs.observe(el);
    return () => {
      if (el) obs.unobserve(el);
    };
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
          onClick={() => navigate("/trainings/templates/add")}
        >
          Add New Template
        </Button>
      </Box>

      {templates.length === 0 && !loading ? (
        <Typography sx={{ textAlign: "center", mt: 4 }}>
          No training templates found.
        </Typography>
      ) : (
        templates.map(tpl => (
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

      {loading && (
        <Typography sx={{ textAlign: "center", mt: 2 }}>
          Loading more…
        </Typography>
      )}
      {/* this empty div triggers loading the next page when it comes into view */}
      <div ref={loadMoreRef} />
    </Box>
  );
}
