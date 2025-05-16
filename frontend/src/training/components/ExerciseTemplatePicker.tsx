import { useState, useEffect, useRef } from "react";
import { Autocomplete, TextField, CircularProgress } from "@mui/material";
import { getExerciseTemplates } from "../api";
import { ExerciseTemplate } from "../types/exerciseTemplate";

interface Props {
  value: number;
  onChange: (id: number) => void;
}

export default function ExerciseTemplatePicker({ value, onChange }: Props) {
  const [inputValue, setInputValue] = useState("");
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<ExerciseTemplate[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const listboxRef = useRef<HTMLUListElement>(null);

  const fetchPage = (pg: number, term: string, append = false) => {
    setLoading(true);
    getExerciseTemplates(pg, term)
      .then(({ results, next }) => {
        setOptions(prev => (append ? [...prev, ...results] : results));
        setPage(pg + 1);
        setHasMore(!!next);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setOptions([]);
    setPage(1);
    setHasMore(true);
    fetchPage(1, search, false);
  }, [search]);

  useEffect(() => {
    const lb = listboxRef.current;
    if (!lb) return;
    const onScroll = () => {
      if (
        lb.scrollTop + lb.clientHeight >= lb.scrollHeight - 20 &&
        hasMore &&
        !loading
      ) {
        fetchPage(page, search, true);
      }
    };
    lb.addEventListener("scroll", onScroll);
    return () => lb.removeEventListener("scroll", onScroll);
  }, [page, hasMore, loading]);

  const selected = options.find(o => o.id === value) || null;

  return (
    <Autocomplete
      openOnFocus
      getOptionLabel={opt => opt.name}
      options={options}
      loading={loading}
      inputValue={inputValue}
      onInputChange={(_, v, reason) => {
        setInputValue(v);
        if (reason === "input") setSearch(v);
      }}
      value={selected}
      onChange={(_, v) => {
        onChange(v ? v.id : 0);
        setInputValue(v ? v.name : "");
      }}
      ListboxProps={{ ref: listboxRef }}
      renderInput={params => (
        <TextField
          {...params}
          label="Choose Exercise Template"
          sx={{ mb: 2 }}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading && <CircularProgress size={20} />}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}
