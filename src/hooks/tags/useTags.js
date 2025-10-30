import { useState, useRef, useEffect } from "react";
import useSWR from "swr";
import { fetchTags } from "../../service/api";

export const useTags = (initialTags = [], mode = "create") => {
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagSearchInput, setTagSearchInput] = useState("");
  const initialTagsRef = useRef([]);
  const tagsInitializedRef = useRef(false);

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
    if (
      mode === "edit" &&
      initialTags.length > 0 &&
      !tagsInitializedRef.current
    ) {
      const formattedTags = initialTags.map((tag) => {
        if (typeof tag === "object" && tag.name) {
          return { value: tag.name, label: tag.name };
        }
        return { value: tag, label: tag };
      });
      setSelectedTags(formattedTags);
      initialTagsRef.current = formattedTags.map((tag) => tag.value);
      tagsInitializedRef.current = true;
    }
  }, [mode, initialTags]);

  const tagOptions = tagSearchInput
    ? searchedTags.map((tag) => ({ value: tag, label: tag }))
    : allTags.map((tag) => ({ value: tag, label: tag }));

  const tagValues = selectedTags.map((tag) => tag.value);

  const hasTagChanges =
    mode === "create"
      ? selectedTags.length > 0
      : tagsInitializedRef.current &&
        JSON.stringify(selectedTags.map((t) => t.value).sort()) !==
          JSON.stringify(initialTagsRef.current.map((t) => t.value).sort());
  //Проверка tagsInitializedRef.current гарантирует что изменения отслеживаются только после инициализации

  return {
    selectedTags,
    setSelectedTags,
    tagSearchInput,
    setTagSearchInput,
    tagOptions,
    tagValues,
    isSearching,
    hasTagChanges,
  };
};
