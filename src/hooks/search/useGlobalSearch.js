import { useContext, useState } from "react";
import useSWR from "swr";
import { SearchContext } from "../../contexts/SearchContext.js";
import {
  fetchSearchAll,
  fetchItemsSearch,
  fetchAdminSearch,
} from "../../service/api.js";

export const useGlobalSearch = (context = "global", inventoryId = null) => {
  const { searchTerm } = useContext(SearchContext);
  const [page, setPage] = useState(1);

  let url = null;
  let fetcher = fetchSearchAll;

  if (searchTerm && searchTerm.trim().length >= 1) {
    if (context === "inventory" && inventoryId) {
      url = `/search/items?q=${encodeURIComponent(
        searchTerm
      )}&inventoryId=${inventoryId}&page=${page}&limit=20`;
      fetcher = fetchItemsSearch;
    } else if (context === "admin") {
      url = `/search/admin?q=${encodeURIComponent(
        searchTerm
      )}&page=${page}&limit=20`;
      fetcher = fetchAdminSearch;
    } else {
      url = `/search?q=${encodeURIComponent(searchTerm)}&page=${page}&limit=20`;
    }
  }

  const { data, error, isLoading } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  const goToNextPage = () => {
    if (data?.pagination && page < data.pagination.totalPages) {
      setPage(page + 1);
    }
  };

  const goToPrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const goToPage = (newPage) => {
    setPage(newPage);
  };

  return {
    searchResults: data?.data || [],
    pagination: data?.pagination || null,
    isLoading,
    error,
    searchTerm,
    hasResults: data?.data?.length > 0,
    currentPage: page,
    goToNextPage,
    goToPrevPage,
    goToPage,
  };
};
