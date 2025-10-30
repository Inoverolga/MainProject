import { useState } from "react";
import useSWR from "swr";
import { fetchUserSearch } from "../../service/api.js";

export const useUserSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: result,
    error,
    isLoading: isSearching,
  } = useSWR(
    searchTerm && searchTerm.length >= 2
      ? `/search/users?q=${encodeURIComponent(searchTerm)}`
      : null,
    fetchUserSearch,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300,
    }
  );

  const clearSearch = () => setSearchTerm("");

  return {
    searchTerm,
    setSearchTerm,
    resultsSearchUsers: result || [],
    isSearching,
    error,
    clearSearch,
  };
};
