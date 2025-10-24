import { useState, useRef, useMemo, useEffect } from "react";
import useSWR from "swr";
import { fetchTags } from "../service/api";

export const useTags = (initialTags = [], mode = "create") => {
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagSearchInput, setTagSearchInput] = useState("");
  const initialTagsRef = useRef([]);

  const { data: allTags = [] } = useSWR("/tags", fetchTags, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  const { data: searchedTags = [], isLoading: isSearching } = useSWR(
    tagSearchInput
      ? `/tags/autocompletion?q=${encodeURIComponent(tagSearchInput)}`
      : null,
    fetchTags,
    { keepPreviousData: true, revalidateOnFocus: false }
  );

  useEffect(() => {
    if (mode === "edit" && initialTags.length > 0) {
      const formattedTags = initialTags.map((tag) => {
        if (typeof tag === "object" && tag.name) {
          return { value: tag.name, label: tag.name };
        }
        return { value: tag, label: tag };
      });
      setSelectedTags(formattedTags);
      initialTagsRef.current = formattedTags.map((tag) => tag.value);
    }
  }, [mode, initialTags]);

  const tagOptions = useMemo(() => {
    const options = tagSearchInput ? searchedTags : allTags;
    return options.map((tag) => ({ value: tag, label: tag }));
  }, [allTags, searchedTags, tagSearchInput]);

  const tagValues = selectedTags.map((tag) => tag.value);

  const hasChanges =
    mode === "create" ||
    JSON.stringify(tagValues) !== JSON.stringify(initialTagsRef.current);

  return {
    selectedTags,
    setSelectedTags,
    tagSearchInput,
    setTagSearchInput,
    tagOptions,
    tagValues,
    isSearching,
    hasChanges,
  };
};
