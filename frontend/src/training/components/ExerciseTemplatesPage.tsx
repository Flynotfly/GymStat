import {Box, Grid2, Tab, Tabs, Typography} from "@mui/material";
import {SyntheticEvent, useEffect, useRef, useState} from "react";
import {getExerciseTemplates} from "../api.ts";
import ExerciseTemplateCard from "./ExerciseTemplateCard.tsx";
import {ExerciseTemplate, ExerciseTemplateTag, ExerciseTemplateType} from "../types/exerciseTemplate";

export default function ExerciseTemplatesPage() {

  const [templates, setTemplates] = useState<ExerciseTemplate[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  // ----- filters ----- //
  const [selectedType, setSelectedType] = useState<ExerciseTemplateType>(null);
  const [selectedTags, setSelectedTags] =  useState<ExerciseTemplateTag[]>([]);
  const [searchText, setSearchText] = useState<string>('');

  const loadMoreRef = useRef<HTMLDivElement>(null);

  /**
   * Fetch templates from the server.
   *
   * @param pageToFetch - The page number to fetch.
   * @param append - Whether to append the new templates or replace the list.
   */
  const fetchTemplates = (pageToFetch: number, append = false) => {
    setLoading(true);
    getExerciseTemplates(pageToFetch, searchText, selectedType, selectedTags)
      .then((data) => {
        if (append) {
          setTemplates((prev) => [...prev, ...data.results])
        } else {
          setTemplates(data.results);
        }
        setPage(pageToFetch + 1);
        if (data.next) {
          setHasMore(true);
        } else {
          setHasMore(false)
        }
      })
      .catch((err) => console.error("Error fetching exercise templates: ", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setTemplates([]);
    setPage(1);
    setHasMore(true);
    fetchTemplates(1, false)
  }, [selectedType, selectedTags, searchText]);

  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchTemplates(page, true);
        }
      },
      { threshold: 1}
    );
    const currentElement = loadMoreRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }
    return () => {
      if (currentElement) {
        observer.unobserve(currentElement)
      }
    };
  }, [page, hasMore, loading, selectedType, selectedTags, searchText]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Exercises
      </Typography>
      <Tabs value={tab} onChange={handleChangeTab} sx={{ mb: 3 }}>
        <Tab label="Base" value="base" />
        <Tab label="My" value="my" />
      </Tabs>

      <Grid2 container spacing={2}>
        {currentTemplates.map(template => (
          <Grid2 size={{xs: 12, sm: 6,md: 4}} key={template.id}>
            <ExerciseTemplateCard template={template} />
          </Grid2>
        ))}
      </Grid2>
    </Box>
  )
}