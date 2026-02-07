import { createContext, useState, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const SearchContext = createContext(null);

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within SearchProvider");
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchActive, setSearchActive] = useState(false);

  const navigate = useNavigate();

  const performSearch = useCallback(async (query) => {
    const trimmed = query?.trim();
    if (!trimmed) {
      setSearchResults([]);
      setSearchActive(false);
      return;
    }

    setIsSearching(true);
    setSearchActive(true);

    try {
      const response = await fetch(
        `/api/products/search?q=${encodeURIComponent(trimmed)}`
      );
      if (!response.ok) throw new Error("Search failed");

      const data = await response.json();
      setSearchResults(data.products ?? data ?? []);
    } catch (err) {
      console.error(err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSearch = useCallback(
    (query) => {
      setSearchQuery(query);
      performSearch(query);
    },
    [performSearch]
  );

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchActive(false);
  }, []);

  const navigateToProduct = useCallback(
    (productId) => {
      navigate(`/products/${productId}`);
      clearSearch();
    },
    [navigate, clearSearch]
  );

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        searchResults,
        isSearching,
        searchActive,
        handleSearch,
        clearSearch,
        navigateToProduct,
        setSearchActive,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export default SearchContext;
