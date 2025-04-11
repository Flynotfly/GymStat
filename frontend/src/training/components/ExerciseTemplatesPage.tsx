import {Box, Grid2, Tab, Tabs, Typography} from "@mui/material";
import {SyntheticEvent, useEffect, useRef, useState} from "react";
import {ExerciseTemplate} from "../types/training";
import {getExerciseTemplates} from "../api.ts";
import ExerciseTemplateCard from "./ExerciseTemplateCard.tsx";

export default function ExerciseTemplatesPage() {

  const [templates, setTemplates] = useState<ExerciseTemplate[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  // ----- filters ----- //
  const [selectedType, setSelectedType] = useState<'all' | 'base' | 'my'>('all');
  const [selectedTag, setSelectedTag] =  useState<string>('');
  const [searchText, setSearchText] = useState<string>('');

  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getExerciseTemplates(1, 'admin')
      .then(data => setBaseExerciseTemplates(data.results))
      .catch(err => console.error("Error fetch base exercise templates: " + err))
  }, []);
  useEffect(() => {
    getExerciseTemplates(1, 'user')
      .then(data => setUserExerciseTemplates(data.results))
      .catch(err => console.error("Error fetch user exercise templates: " + err))
  }, []);

  const handleChangeTab = (_: SyntheticEvent, newValue: 'base' | 'my') => {
    setTab(newValue);
  };
  const currentTemplates = tab === 'base' ? baseExerciseTemplates : userExerciseTemplates;

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