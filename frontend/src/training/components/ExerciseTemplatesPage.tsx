import {
  Box,
  Grid2,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel, Radio, RadioGroup,
} from "@mui/material";
import {ChangeEvent, useEffect, useRef, useState} from "react";
import {createExerciseTemplate, getExerciseTemplates} from "../api.ts";
import ExerciseTemplateCard from "./ExerciseTemplateCard.tsx";
import {
  ExerciseTemplate, ExerciseTemplateField,
  ExerciseTemplateTag,
  ExerciseTemplateType,
  ExerciseTemplateTypeChoose, NewExerciseTemplate
} from "../types/exerciseTemplate";
import FormControl from "@mui/material/FormControl";

export default function ExerciseTemplatesPage() {

  const [templates, setTemplates] = useState<ExerciseTemplate[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);

  // ----- filters and search ----- //
  const [selectedType, setSelectedType] = useState<ExerciseTemplateTypeChoose>('all');
  const [selectedTags, setSelectedTags] =  useState<ExerciseTemplateTag[]>([]);
  const [searchText, setSearchText] = useState<string>('');
  const [debouncedSearchText, setDebouncedSearchText] = useState<string>(searchText);

  // ----- add form ----- //
  const [open, setOpen] = useState<boolean>(false)
  const [newTemplate, setNewTemplate] = useState<NewExerciseTemplate>({
    name: "",
    description: "",
    tags: [],
    fields: [],
  });

  const loadMoreRef = useRef<HTMLDivElement>(null);

  const tagOptions: ExerciseTemplateTag[] = [
    "chest","biceps","cardio","cycling","running","free weight","machine",
    "triceps","legs","back","shoulders","abs","core","HIIT","yoga","pilates"
  ]

  const fieldOptions: ExerciseTemplateField[] = [
    "sets","reps","weight","time","distance","speed",
    "rounds","rest","rpe","attempts","successes","notes","tempo"
  ]

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchText]);


  /**
   * Fetch templates from the server.
   *
   * @param pageToFetch - The page number to fetch.
   * @param append - Whether to append the new templates or replace the list.
   */
  const fetchTemplates = (pageToFetch: number, append = false) => {
    setLoading(true);
    let templateType: ExerciseTemplateType = null;
    if (selectedType === 'onlyMy') {
      templateType = 'user';
    } else if (selectedType === 'exceptMy') {
      templateType = 'admin';
    }
    getExerciseTemplates(pageToFetch, debouncedSearchText, templateType, selectedTags)
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
        console.log('fetch exercise templates: ', data); // TODO: remove
      })
      .catch((err) => console.error("Error fetching exercise templates: ", err))
      .finally(() => setLoading(false));
  };

  // Update filters
  useEffect(() => {
    setTemplates([]);
    setPage(1);
    setHasMore(true);
    fetchTemplates(1, false)
  }, [selectedType, selectedTags, debouncedSearchText]);

  // Infinity scroll
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
  }, [page, hasMore, loading, selectedType, selectedTags, debouncedSearchText]);

  const handleTypeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedType(event.target.value as ExerciseTemplateTypeChoose);
  };

  const handleTagChange = (event: ChangeEvent<HTMLInputElement>, tag: ExerciseTemplateTag) => {
    if (event.target.checked) {
      setSelectedTags([...selectedTags, tag]);
    } else {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    }
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };

  // Add template

  const handleOpen = () => setOpen(true)
  const handleClose = () => {
    setOpen(false);
    setNewTemplate({
      name: "",
      description: "",
      tags: [],
      fields: [],
    })
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
        Exercises
      </Typography>

      {/*Search bar*/}
      <TextField
        fullWidth
        label="Search"
        variant="outlined"
        value={searchText}
        onChange={handleSearchChange}
        sx={{ mb: 2 }}
        />

      {/* Template Type Filter as a Radio Group */}
      <FormControl component="fieldset" sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Template Type
        </Typography>
        <RadioGroup
          row
          value={selectedType}
          onChange={handleTypeChange}
        >
          <FormControlLabel value="all" control={<Radio />} label="All" />
          <FormControlLabel value="onlyMy" control={<Radio />} label="Only My" />
          <FormControlLabel value="exceptMy" control={<Radio />} label="Except My" />
        </RadioGroup>
      </FormControl>

      {/* Tags Filter */}
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Tags
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 2 }}>
        {tagOptions.map((tag) => (
          <FormControlLabel
            key={tag}
            control={
              <Checkbox
                checked={selectedTags.includes(tag as ExerciseTemplateTag)}
                onChange={(event) => handleTagChange(event, tag as ExerciseTemplateTag)}
              />
            }
            label={tag}
          />
        ))}
      </Box>

      {templates.length > 0 ? (
        <Grid2 container spacing={2}>
          {templates.map(template => (
            <Grid2 size={{xs: 12, md: 6, lg: 4}} key={template.id}>
              <ExerciseTemplateCard template={template} />
            </Grid2>
          ))}
        </Grid2>
      ) : !loading && (
        <Typography variant="body1" sx={{ textAlign: 'center', mt: 4 }}>
          No templates found.
        </Typography>
      )}

      {/* Loading Indicator */}
      {loading && <Typography variant="body1" sx={{ textAlign: 'center' }}>Loading...</Typography>}

      {/* Infinite Scroll Trigger */}
      <div ref={loadMoreRef} />
    </Box>
  )
}