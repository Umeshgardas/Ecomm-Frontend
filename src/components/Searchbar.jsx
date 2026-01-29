import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useSearch } from "../contexts/SearchContext";
import "./SearchBar.css";

const SearchBar = ({ onClose }) => {
  const {
    searchQuery,
    searchResults,
    isSearching,
    searchActive,
    handleSearch,
    clearSearch,
    navigateToProduct,
  } = useSearch();

  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localQuery.trim()) {
        handleSearch(localQuery);
        setDropdownOpen(true);
      } else {
        clearSearch();
        setDropdownOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localQuery, handleSearch, clearSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        if (dropdownOpen) {
          setDropdownOpen(false);
        } else if (onClose) {
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [dropdownOpen, onClose]);

  const handleInputChange = (e) => {
    setLocalQuery(e.target.value);
  };

  const handleClear = () => {
    setLocalQuery("");
    clearSearch();
    setDropdownOpen(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleResultClick = (productId) => {
    navigateToProduct(productId);
    setDropdownOpen(false);
    if (onClose) {
      onClose();
    }
  };

  const formatPrice = (price) => {
    return `₹${Number(price).toLocaleString("en-IN")}`;
  };

  const highlightMatch = (text, query) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.trim()})`, "gi");
    const parts = text.split(regex);
    
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="search-highlight">
          {part}
        </mark>
      ) : (
        part
      ),
    );
  };

  return (
    <div className="search-bar-container" ref={searchRef}>
      <div className="search-input-wrapper">
        <span className="search-icon" aria-hidden="true">
          🔍
        </span>
        <input
          ref={inputRef}
          type="text"
          className="search-input"
          placeholder="Search for shirts, linen, oxford cotton..."
          value={localQuery}
          onChange={handleInputChange}
          aria-label="Search products"
          aria-autocomplete="list"
          aria-controls="search-results"
          aria-expanded={dropdownOpen}
        />
        {localQuery && (
          <button
            className="search-clear"
            onClick={handleClear}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
        {isSearching && (
          <div className="search-spinner" aria-live="polite" aria-label="Searching...">
            ⏳
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {dropdownOpen && searchActive && (
        <div
          id="search-results"
          className="search-dropdown"
          role="listbox"
          aria-label="Search results"
        >
          {isSearching ? (
            <div className="search-loading">
              <div className="loading-spinner"></div>
              <p>Searching...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <>
              <div className="search-results-header">
                <span className="results-count">
                  {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} found
                </span>
              </div>
              <ul className="search-results-list">
                {searchResults.slice(0, 8).map((product) => (
                  <li
                    key={product._id || product.id}
                    className="search-result-item"
                    role="option"
                  >
                    <button
                      className="search-result-button"
                      onClick={() => handleResultClick(product._id || product.id)}
                    >
                      <div className="result-image">
                        {product.image ? (
                          <img src={product.image} alt={product.name} />
                        ) : (
                          <div className="result-image-placeholder">
                            {product.name?.charAt(0) || "P"}
                          </div>
                        )}
                      </div>
                      <div className="result-details">
                        <h4 className="result-name">
                          {highlightMatch(product.name, localQuery)}
                        </h4>
                        <p className="result-category">
                          {product.category || "Shirt"}
                        </p>
                        <div className="result-footer">
                          <span className="result-price">
                            {formatPrice(product.price)}
                          </span>
                          {product.soldOut && (
                            <span className="result-badge sold-out">Sold Out</span>
                          )}
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
              {searchResults.length > 8 && (
                <div className="search-footer">
                  <Link
                    to={`/search?q=${encodeURIComponent(localQuery)}`}
                    className="view-all-link"
                    onClick={() => {
                      setDropdownOpen(false);
                      if (onClose) onClose();
                    }}
                  >
                    View all {searchResults.length} results →
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="search-no-results">
              <div className="no-results-icon">🔍</div>
              <h4>No products found</h4>
              <p>Try searching with different keywords</p>
              <div className="search-suggestions">
                <p className="suggestions-title">Popular searches:</p>
                <div className="suggestion-tags">
                  <button
                    className="suggestion-tag"
                    onClick={() => setLocalQuery("Linen")}
                  >
                    Linen
                  </button>
                  <button
                    className="suggestion-tag"
                    onClick={() => setLocalQuery("Oxford Cotton")}
                  >
                    Oxford Cotton
                  </button>
                  <button
                    className="suggestion-tag"
                    onClick={() => setLocalQuery("Formal")}
                  >
                    Formal
                  </button>
                  <button
                    className="suggestion-tag"
                    onClick={() => setLocalQuery("Casual")}
                  >
                    Casual
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;