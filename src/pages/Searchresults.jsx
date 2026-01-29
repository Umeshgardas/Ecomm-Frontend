import { useEffect, useState, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useSearch } from "../contexts/SearchContext";
import ProductCard from "../components/ProductCard";
import "./SearchResults.css";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const { searchResults, isSearching, handleSearch } = useSearch();
  const [localResults, setLocalResults] = useState([]);

  useEffect(() => {
    if (query) {
      handleSearch(query);
    }
  }, [query, handleSearch]);

  useEffect(() => {
    setLocalResults(searchResults);
  }, [searchResults]);

  const formatPrice = useCallback((price) => {
    return `₹${Number(price).toLocaleString("en-IN")}`;
  }, []);

  if (isSearching) {
    return (
      <div className="search-results-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Searching for "{query}"...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="search-results-page">
      <div className="search-results-header">
        <h1>Search Results</h1>
        <p className="search-query">
          Showing results for: <strong>"{query}"</strong>
        </p>
        {localResults.length > 0 && (
          <p className="results-count">
            {localResults.length} {localResults.length === 1 ? "product" : "products"} found
          </p>
        )}
      </div>

      {localResults.length === 0 && !isSearching ? (
        <div className="no-results-container">
          <div className="no-results-icon">🔍</div>
          <h2>No products found</h2>
          <p>We couldn't find any products matching "{query}"</p>
          <div className="no-results-suggestions">
            <h3>Try searching for:</h3>
            <div className="suggestion-links">
              <Link to="/collections/linen" className="suggestion-link">
                Linen Shirts
              </Link>
              <Link to="/collections/oxford-cotton" className="suggestion-link">
                Oxford Cotton
              </Link>
              <Link to="/collections/all-shirts" className="suggestion-link">
                All Shirts
              </Link>
            </div>
          </div>
          <Link to="/" className="back-home-btn">
            ← Back to Shop
          </Link>
        </div>
      ) : (
        <>
          <div className="search-results-grid">
            {localResults.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>

          <div className="search-footer">
            <Link to="/" className="continue-shopping">
              ← Continue Shopping
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default SearchResults;