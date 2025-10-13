import { useState, createContext } from "react";

export const SearchContext = createContext();

export const SearchProvider = ({ children }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const value = {
    searchTerm,
    setSearchTerm,
    clearSearch: () => setSearchTerm(""),
  };
  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
};
