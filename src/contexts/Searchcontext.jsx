import { createContext, useState, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const SearchContext = createContext();

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
    if (!query || query.trim().length === 0) {
      setSearchResults([]);
      setSearchActive(false);
      return;
    }

    setIsSearching(true);
    setSearchActive(true);

    try {
      // Search API endpoint
      const response = await fetch(
        `/api/products/search?q=${encodeURIComponent(query.trim())}`,
      );

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      setSearchResults(data.products || data || []);
    } catch (error) {
      console.error("Search error:", error);
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
    [performSearch],
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
    [navigate, clearSearch],
  );

  const value = {
    searchQuery,
    searchResults,
    isSearching,
    searchActive,
    handleSearch,
    clearSearch,
    navigateToProduct,
    setSearchActive,
  };

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
};

export default SearchContext;