import { useEffect, useState, useMemo, useCallback, useContext } from "react";
import { Link } from "react-router-dom";
import { getProducts } from "../api/products";
import { ThemeContext } from "../contexts/ThemeContext";
import ProductCard from "./ProductCard";
import "./CollectionTemplate.css";

const CollectionTemplate = ({ 
  title, 
  description, 
  category = "all", 
  sortBy = "default",
  onSale = false 
}) => {
  const { isDark } = useContext(ThemeContext);
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [wishlist, setWishlist] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getProducts(page);
        if (res && res.data) {
          setProducts(res.data.products || res.data || []);
          setPages(res.data.pages || res.data.totalPages || 1);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [page]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by category
    if (category !== "all") {
      filtered = filtered.filter(p => p.category === category);
    }

    // Filter by sale
    if (onSale) {
      filtered = filtered.filter(p => p.originalPrice && p.originalPrice > p.price);
    }

    // Sort products
    if (sortBy === "date") {
      filtered = [...filtered].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });
    } else if (sortBy === "priceLow") {
      filtered = [...filtered].sort((a, b) => a.price - b.price);
    } else if (sortBy === "priceHigh") {
      filtered = [...filtered].sort((a, b) => b.price - a.price);
    }

    return filtered;
  }, [products, category, onSale, sortBy]);

  const handleNextPage = useCallback(() => {
    if (page < pages) {
      setPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [page, pages]);

  const handlePrevPage = useCallback(() => {
    if (page > 1) {
      setPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [page]);

  // Wishlist functions
  const toggleWishlist = useCallback((productId) => {
    setWishlist((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }
      return [...prev, productId];
    });
  }, []);

  // Format price
  const formatPrice = useCallback((price) => {
    return `₹${Number(price).toLocaleString("en-IN")}`;
  }, []);

  // Render product card with fallback
  const renderProductCard = useCallback((product) => {
    const productId = product._id || product.id;
    const isInWishlist = wishlist.includes(productId);

    if (ProductCard && typeof ProductCard === "function") {
      return (
        <ProductCard 
          key={productId} 
          product={product}
          isInWishlist={isInWishlist}
          onToggleWishlist={() => toggleWishlist(productId)}
        />
      );
    }

    // Fallback card with Link to product detail
    return (
      <div key={productId} className="product-card">
        <Link to={`/products/${productId}`} className="product-image-link">
          <div className="product-image">
            <div className="image-placeholder">
              {product.image ? (
                <img src={product.image} alt={product.name} />
              ) : (
                <div className="placeholder-text">{product.name?.charAt(0) || 'P'}</div>
              )}
            </div>
            {product.soldOut && <div className="sold-out-badge">Sold Out</div>}
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="discount-badge">
                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
              </div>
            )}
          </div>
        </Link>
        
        <div className="product-info">
          <div className="product-category">{product.category || 'Uncategorized'}</div>
          <h3 className="product-name">
            <Link to={`/products/${productId}`}>{product.name}</Link>
          </h3>
          <div className="product-price">
            <span className="regular-price">{formatPrice(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="original-price">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          <div className="product-actions">
            <button
              className="wishlist-button"
              aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
              onClick={(e) => {
                e.preventDefault();
                toggleWishlist(productId);
              }}
              style={{ color: isInWishlist ? '#ff4444' : '#ddd' }}
            >
              {isInWishlist ? "❤️" : "🤍"}
            </button>
            <Link 
              to={`/products/${productId}`}
              className="quick-view-link"
            >
              Quick View →
            </Link>
          </div>
        </div>
      </div>
    );
  }, [wishlist, toggleWishlist, formatPrice]);

  return (
    <div className="collection-container">
      <div className="collection-header">
        <h1>{title}</h1>
        {description && <p className="collection-description">{description}</p>}
        <p className="product-count">
          {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
        </p>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading products...</p>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {!loading && filteredProducts.length === 0 && (
        <div className="no-products">
          <div className="no-products-icon">📦</div>
          <h3>No Products Found</h3>
          <p>
            {onSale 
              ? "No products on sale at the moment. Check back soon!"
              : `No ${category !== "all" ? category : ""} products available yet.`}
          </p>
          <Link to="/collections/all-shirts" className="btn btn-primary">
            Browse All Products
          </Link>
        </div>
      )}

      {!loading && filteredProducts.length > 0 && (
        <>
          <div className="product-grid">
            {filteredProducts.map(renderProductCard)}
          </div>

          {pages > 1 && (
            <div className="pagination">
              <button
                onClick={handlePrevPage}
                disabled={page === 1}
                className="pagination-button"
              >
                ← Previous
              </button>
              <span className="page-info">
                Page {page} of {pages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={page === pages}
                className="pagination-button"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CollectionTemplate;