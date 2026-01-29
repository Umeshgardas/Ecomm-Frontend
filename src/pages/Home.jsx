import { useEffect, useState, useCallback, useMemo, useContext } from "react";
import { getProducts } from "../api/products";
import ProductCard from "../components/ProductCard";
import { AuthContext } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";
import "./Home.css";

const Home = () => {
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  // API Data State
  const [products, setProducts] = useState([]);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Context hooks
  const { user } = useContext(AuthContext);
  const { showNotification } = useNotification();

  // Filter State
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMaterial, setSelectedMaterial] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });

  // UI State
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState({});
  const [viewMode, setViewMode] = useState('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);
  
  // Quick View State
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // ============================================
  // DATA FETCHING EFFECTS
  // ============================================
  
  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getProducts(page);
        if (res && res.data) {
          const productsData = res.data.products || res.data || [];
          setProducts(productsData);
          setPages(res.data.pages || res.data.totalPages || 1);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again later.");
        showNotification("Failed to load products", { type: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [page, showNotification]);

  // Fetch wishlist from API when user logs in
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user?.token) {
        setWishlist([]);
        return;
      }

      try {
        const response = await fetch("/api/users/profile", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to load profile");

        const data = await response.json();
        if (Array.isArray(data.favorites)) {
          setWishlist(data.favorites.map((fav) => fav._id || fav.id));
        }
      } catch (err) {
        console.error("Error fetching wishlist:", err);
        showNotification("Failed to load wishlist", { type: "error" });
      }
    };

    fetchWishlist();
  }, [user, showNotification]);

  // Fetch cart from API when user logs in
  useEffect(() => {
    const fetchCart = async () => {
      if (!user?.token) {
        setCartItems([]);
        return;
      }

      try {
        const response = await fetch("/api/users/cart", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (!response.ok) throw new Error("Failed to load cart");

        const data = await response.json();
        if (Array.isArray(data.items)) {
          setCartItems(data.items);
        }
      } catch (err) {
        console.error("Error fetching cart:", err);
        // Silent fail for cart - not critical on page load
      }
    };

    fetchCart();
  }, [user]);

  // ============================================
  // CAROUSEL AUTO-PLAY
  // ============================================
  
  useEffect(() => {
    if (!isAutoPlaying || carouselProducts.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselProducts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, products.length]);

  // Close cart on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        if (cartOpen) {
          setCartOpen(false);
        }
        if (quickViewOpen) {
          setQuickViewOpen(false);
        }
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [cartOpen, quickViewOpen]);

  // ============================================
  // MEMOIZED DATA
  // ============================================
  
  // Get carousel products (first 5 products)
  const carouselProducts = useMemo(() => {
    return products.slice(0, 5);
  }, [products]);

  // Get new arrivals (latest 6 products)
  const newArrivals = useMemo(() => {
    return products.slice(0, 6);
  }, [products]);

  // Get remaining products for main grid
  const remainingProducts = useMemo(() => {
    return products.slice(6);
  }, [products]);

  // Get unique categories and materials
  const categories = useMemo(() => {
    if (!products || products.length === 0) return ["all"];
    return ["all", ...new Set(products.map((p) => p.category).filter(Boolean))];
  }, [products]);

  const materials = useMemo(() => {
    if (!products || products.length === 0) return ["all"];
    const allMaterials = products
      .map((p) => p.material || p.fabric)
      .filter(Boolean);
    return ["all", ...new Set(allMaterials)];
  }, [products]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...remainingProducts];

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Filter by material
    if (selectedMaterial !== "all") {
      filtered = filtered.filter(
        (p) => p.material === selectedMaterial || p.fabric === selectedMaterial,
      );
    }

    // Filter by price range
    filtered = filtered.filter(
      (p) => p.price >= priceRange.min && p.price <= priceRange.max,
    );

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-desc":
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        // Keep default order
        break;
    }

    return filtered;
  }, [
    remainingProducts,
    selectedCategory,
    selectedMaterial,
    sortBy,
    priceRange,
  ]);

  // Calculate cart totals
  const cartTotal = useMemo(() => {
    return cartItems.reduce(
      (total, item) => total + Number(item.price) * item.quantity,
      0,
    );
  }, [cartItems]);

  const cartItemCount = useMemo(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  
  // Format price to Indian Rupees
  const formatPrice = useCallback((price) => {
    return `₹${Number(price).toLocaleString("en-IN")}`;
  }, []);

  // ============================================
  // WISHLIST HANDLERS
  // ============================================
  
  const addToFavorites = async (productId) => {
    if (!user?.token) {
      showNotification("Please login to add favorites", { type: "error" });
      return false;
    }

    setWishlistLoading((prev) => ({ ...prev, [productId]: true }));

    try {
      const response = await fetch("/api/users/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ productId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add to favorites");
      }

      setWishlist((prev) => [...prev, productId]);
      showNotification("Added to favorites!", { type: "success" });
      return true;
    } catch (error) {
      console.error("Error adding to favorites:", error);
      showNotification(error.message || "Failed to add to favorites", {
        type: "error",
      });
      return false;
    } finally {
      setWishlistLoading((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const removeFromFavorites = async (productId) => {
    if (!user?.token) {
      showNotification("Please login to manage favorites", { type: "error" });
      return false;
    }

    setWishlistLoading((prev) => ({ ...prev, [productId]: true }));

    try {
      const response = await fetch(`/api/users/favorites/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to remove from favorites");
      }

      setWishlist((prev) => prev.filter((id) => id !== productId));
      showNotification("Removed from favorites", { type: "success" });
      return true;
    } catch (error) {
      console.error("Error removing from favorites:", error);
      showNotification(error.message || "Failed to remove from favorites", {
        type: "error",
      });
      return false;
    } finally {
      setWishlistLoading((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const toggleWishlist = async (productId) => {
    const isInWishlist = wishlist.includes(productId);

    if (isInWishlist) {
      await removeFromFavorites(productId);
    } else {
      await addToFavorites(productId);
    }
  };

  // ============================================
  // CART HANDLERS
  // ============================================
  
  const addToCart = useCallback(
    async (product) => {
      if (!user?.token) {
        showNotification("Please login to add to cart", { type: "error" });
        return;
      }

      try {
        const response = await fetch("/api/users/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            productId: product._id || product.id,
            quantity: 1,
            size: "M",
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to add to cart");
        }

        // Update local cart state optimistically
        setCartItems((prev) => {
          const existing = prev.find(
            (item) => item._id === product._id || item.id === product.id,
          );
          if (existing) {
            return prev.map((item) =>
              item._id === product._id || item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            );
          }
          return [...prev, { ...product, quantity: 1, size: "M" }];
        });

        showNotification(`${product.name} added to cart!`, { type: "success" });
        setCartOpen(true);
      } catch (error) {
        console.error("Error adding to cart:", error);
        showNotification(error.message || "Failed to add to cart", {
          type: "error",
        });
      }
    },
    [user, showNotification],
  );

  const removeFromCart = useCallback(
    async (productId) => {
      // Optimistic update
      setCartItems((prev) =>
        prev.filter((item) => item._id !== productId && item.id !== productId),
      );

      if (!user?.token) return;

      try {
        const response = await fetch(`/api/users/cart/${productId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to remove from cart");
        }

        showNotification("Item removed from cart", { type: "success" });
      } catch (error) {
        console.error("Error removing from cart:", error);
        showNotification("Failed to remove from cart", { type: "error" });
      }
    },
    [user, showNotification],
  );

  const updateQuantity = useCallback(
    async (productId, quantity) => {
      if (quantity <= 0) {
        removeFromCart(productId);
        return;
      }

      // Optimistic update
      setCartItems((prev) =>
        prev.map((item) =>
          item._id === productId || item.id === productId
            ? { ...item, quantity }
            : item,
        ),
      );

      if (!user?.token) return;

      try {
        const response = await fetch("/api/users/cart", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            itemId: productId,
            quantity,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update quantity");
        }
      } catch (error) {
        console.error("Error updating quantity:", error);
        showNotification("Failed to update quantity", { type: "error" });
      }
    },
    [removeFromCart, user, showNotification],
  );

  // ============================================
  // QUICK VIEW HANDLER
  // ============================================
  
  const handleQuickView = useCallback((product) => {
    setQuickViewProduct(product);
    setQuickViewOpen(true);
    addToRecentlyViewed(product);
  }, []);

  const closeQuickView = useCallback(() => {
    setQuickViewOpen(false);
    setTimeout(() => setQuickViewProduct(null), 300); // Wait for animation
  }, []);

  // ============================================
  // RECENTLY VIEWED HANDLER
  // ============================================
  
  const addToRecentlyViewed = useCallback((product) => {
    setRecentlyViewed((prev) => {
      const productId = product._id || product.id;
      const filtered = prev.filter((p) => (p._id || p.id) !== productId);
      return [product, ...filtered].slice(0, 4);
    });
  }, []);

  // ============================================
  // PAGINATION HANDLERS
  // ============================================
  
  const handleNextPage = useCallback(() => {
    if (page < pages) {
      setPage((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [page, pages]);

  const handlePrevPage = useCallback(() => {
    if (page > 1) {
      setPage((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [page]);

  // ============================================
  // CAROUSEL HANDLERS
  // ============================================
  
  const handlePrevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? carouselProducts.length - 1 : prev - 1,
    );
    setIsAutoPlaying(false);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselProducts.length);
    setIsAutoPlaying(false);
  };

  const handleDotClick = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  // ============================================
  // UI HANDLERS
  // ============================================
  
  const resetFilters = () => {
    setSelectedCategory("all");
    setSelectedMaterial("all");
    setSortBy("default");
    setPriceRange({ min: 0, max: 10000 });
    showNotification("Filters have been reset", { type: "info" });
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      showNotification("Your cart is empty!", { type: "warning" });
      return;
    }

    // Close the cart sidebar
    setCartOpen(false);
    
    // Option 1: If using React Router, uncomment this and import useNavigate
    // import { useNavigate } from 'react-router-dom';
    // const navigate = useNavigate();
    // navigate('/checkout');
    
    // Option 2: Direct navigation
    window.location.href = '/checkout';
    
    // Option 3: If you want to handle checkout in a modal/overlay
    // setCheckoutOpen(true);
    
    showNotification("Proceeding to checkout...", { type: "info" });
  };

  // ============================================
  // RENDER PRODUCT CARD
  // ============================================
  
  const renderProductCard = useCallback(
    (product) => {
      const productId = product._id || product.id;
      const isInWishlist = wishlist.includes(productId);
      const isLoading = wishlistLoading[productId];

      if (ProductCard && typeof ProductCard === "function") {
        return (
          <ProductCard
            key={productId}
            product={product}
            onAddToCart={() => addToCart(product)}
            onToggleWishlist={() => toggleWishlist(productId)}
            onQuickView={() => handleQuickView(product)}
            isInWishlist={isInWishlist}
            isWishlistLoading={isLoading}
          />
        );
      }

      // Fallback card rendering
      return (
        <div key={productId} className="product-card">
          <div className="product-image">
            <div className="image-placeholder">
              {product.image && <img src={product.image} alt={product.name} />}

              <div className="image-overlay">
                <button
                  className="quick-view-button"
                  onClick={() => handleQuickView(product)}
                  aria-label={`Quick view ${product.name}`}
                >
                  Quick View
                </button>
                <button
                  className="add-to-cart-button"
                  disabled={product.soldOut}
                  onClick={() => !product.soldOut && addToCart(product)}
                  aria-label={product.soldOut ? "Sold out" : `Add ${product.name} to cart`}
                >
                  {product.soldOut ? "Sold Out" : "Add to Cart"}
                </button>
              </div>
            </div>

            {product.soldOut && <div className="sold-out-badge">Sold Out</div>}
          </div>

          <div className="product-info">
            <div className="product-category">
              {product.category || "Uncategorized"}
            </div>
            <h3 className="product-name">{product.name}</h3>
            <div className="product-price">
              <span className="regular-price">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice &&
                product.originalPrice > product.price && (
                  <span className="original-price">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
            </div>
            <div className="product-actions">
              <button
                className="wishlist-button"
                aria-label={
                  isInWishlist ? "Remove from wishlist" : "Add to wishlist"
                }
                onClick={() => toggleWishlist(productId)}
                disabled={isLoading}
              >
                {isLoading ? "⏳" : isInWishlist ? "❤️" : "🤍"}
              </button>
            </div>
          </div>
        </div>
      );
    },
    [
      wishlist,
      addToCart,
      toggleWishlist,
      handleQuickView,
      formatPrice,
      wishlistLoading,
    ],
  );

  // ============================================
  // RENDER
  // ============================================
  
  return (
    <div className="home-container">
      {/* Hero Carousel */}
      {!loading && carouselProducts.length > 0 && (
        <section className="hero-carousel" aria-label="Featured products carousel">
          <div className="carousel-container">
            <div
              className="carousel-track"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {carouselProducts.map((product) => {
                const productId = product._id || product.id;
                return (
                  <div key={productId} className="carousel-slide">
                    <div className="carousel-image">
                      {product.image ? (
                        <img src={product.image} alt={product.name} />
                      ) : (
                        <div className="carousel-placeholder">No Image</div>
                      )}
                    </div>
                    <div className="carousel-content">
                      <h2 className="carousel-title">{product.name}</h2>
                      <p className="carousel-category">{product.category}</p>
                      <p className="carousel-price">
                        {formatPrice(product.price)}
                      </p>
                      <div className="carousel-actions">
                        <button
                          className="carousel-cta-primary"
                          onClick={() => addToCart(product)}
                          disabled={product.soldOut}
                        >
                          {product.soldOut ? "Sold Out" : "Add to Cart"}
                        </button>
                        <button
                          className="carousel-cta-secondary"
                          onClick={() => handleQuickView(product)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Carousel Controls */}
            {carouselProducts.length > 1 && (
              <>
                <button
                  className="carousel-button carousel-prev"
                  onClick={handlePrevSlide}
                  aria-label="Previous slide"
                >
                  ‹
                </button>
                <button
                  className="carousel-button carousel-next"
                  onClick={handleNextSlide}
                  aria-label="Next slide"
                >
                  ›
                </button>

                <div className="carousel-dots" role="tablist" aria-label="Carousel slides">
                  {carouselProducts.map((_, index) => (
                    <button
                      key={index}
                      className={`carousel-dot ${index === currentSlide ? "active" : ""}`}
                      onClick={() => handleDotClick(index)}
                      aria-label={`Go to slide ${index + 1}`}
                      role="tab"
                      aria-selected={index === currentSlide}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* New Arrivals Section */}
      {!loading && newArrivals.length > 0 && (
        <section className="new-arrivals-section" aria-labelledby="new-arrivals-title">
          <div className="section-header">
            <h2 id="new-arrivals-title" className="section-title">New Arrivals</h2>
            <p className="section-subtitle">Discover our latest collection</p>
          </div>
          <div className="new-arrivals-grid">
            {newArrivals.map(renderProductCard)}
          </div>
        </section>
      )}

      {/* Main Products Section */}
      <main className="main-content">
        {/* Page Header */}
        <div className="page-header">
          <div className="header-left">
            <h1>All Products</h1>
            <p className="product-count">
              {filteredAndSortedProducts.length}{" "}
              {filteredAndSortedProducts.length === 1 ? "Product" : "Products"}{" "}
              Available
            </p>
          </div>
          <div className="header-right">
            <button
              className="view-toggle-btn"
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              aria-label={`Switch to ${viewMode === "grid" ? "list" : "grid"} view`}
              aria-pressed={viewMode === "list"}
            >
              {viewMode === "grid" ? "☰ List View" : "⊞ Grid View"}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-container" role="status" aria-live="polite">
            <div className="loading-spinner" aria-hidden="true"></div>
            <p className="loading-text">Loading products...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-container" role="alert">
            <div className="error-icon" aria-hidden="true">⚠️</div>
            <h3 className="error-title">Oops! Something went wrong</h3>
            <p className="error-message">{error}</p>
            <button
              className="retry-btn"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Main Content - Filters and Products */}
        {!loading && !error && remainingProducts.length > 0 && (
          <>
            {/* Filters Section */}
            <div className="filters-container">
              {/* Mobile Filter Toggle */}
              <button
                className="mobile-filter-toggle"
                onClick={() => setFiltersOpen(!filtersOpen)}
                aria-expanded={filtersOpen}
                aria-controls="filters-section"
              >
                🔍 Filters & Sort
                <span className="filter-count" aria-hidden="true">
                  {(selectedCategory !== "all" ||
                    selectedMaterial !== "all" ||
                    sortBy !== "default") &&
                    "●"}
                </span>
              </button>

              {/* Filters Section */}
              <div 
                id="filters-section"
                className={`filters-section ${filtersOpen ? "open" : ""}`}
              >
                <div className="filters-header">
                  <h3>Filters</h3>
                  <button className="clear-filters-btn" onClick={resetFilters}>
                    Clear All
                  </button>
                </div>

                {/* Filter Groups */}
                <div className="filters-grid">
                  {/* Category Filter */}
                  <div className="filter-group">
                    <label htmlFor="category-filter" className="filter-label">
                      Category
                    </label>
                    <div className="select-wrapper">
                      <select
                        id="category-filter"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="filter-select"
                      >
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category === "all" ? "All Categories" : category}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Material Filter */}
                  <div className="filter-group">
                    <label htmlFor="material-filter" className="filter-label">
                      Material
                    </label>
                    <div className="select-wrapper">
                      <select
                        id="material-filter"
                        value={selectedMaterial}
                        onChange={(e) => setSelectedMaterial(e.target.value)}
                        className="filter-select"
                      >
                        {materials.map((material) => (
                          <option key={material} value={material}>
                            {material === "all" ? "All Materials" : material}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Sort By */}
                  <div className="filter-group">
                    <label htmlFor="sort-select" className="filter-label">
                      Sort By
                    </label>
                    <div className="select-wrapper">
                      <select
                        id="sort-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="filter-select"
                      >
                        <option value="default">Featured</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="name-asc">Name: A to Z</option>
                        <option value="name-desc">Name: Z to A</option>
                        <option value="newest">Newest First</option>
                      </select>
                    </div>
                  </div>

                  {/* Price Range Filter */}
                  <div className="filter-group price-filter-group">
                    <label className="filter-label">Price Range</label>
                    <div className="price-range-display">
                      <span className="price-value">
                        {formatPrice(priceRange.min)}
                      </span>
                      <span className="price-separator">—</span>
                      <span className="price-value">
                        {formatPrice(priceRange.max)}
                      </span>
                    </div>
                    <div className="price-range-sliders">
                      <div className="slider-group">
                        <label htmlFor="min-price" className="slider-label">
                          Min
                        </label>
                        <input
                          id="min-price"
                          type="range"
                          min="0"
                          max="10000"
                          step="100"
                          value={priceRange.min}
                          onChange={(e) => {
                            const newMin = Number(e.target.value);
                            if (newMin <= priceRange.max) {
                              setPriceRange((prev) => ({
                                ...prev,
                                min: newMin,
                              }));
                            }
                          }}
                          className="range-slider"
                          aria-label="Minimum price"
                          aria-valuemin="0"
                          aria-valuemax="10000"
                          aria-valuenow={priceRange.min}
                        />
                      </div>
                      <div className="slider-group">
                        <label htmlFor="max-price" className="slider-label">
                          Max
                        </label>
                        <input
                          id="max-price"
                          type="range"
                          min="0"
                          max="10000"
                          step="100"
                          value={priceRange.max}
                          onChange={(e) => {
                            const newMax = Number(e.target.value);
                            if (newMax >= priceRange.min) {
                              setPriceRange((prev) => ({
                                ...prev,
                                max: newMax,
                              }));
                            }
                          }}
                          className="range-slider"
                          aria-label="Maximum price"
                          aria-valuemin="0"
                          aria-valuemax="10000"
                          aria-valuenow={priceRange.max}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Active Filters */}
                {(selectedCategory !== "all" ||
                  selectedMaterial !== "all" ||
                  sortBy !== "default") && (
                  <div className="active-filters" role="status" aria-live="polite">
                    <span className="active-filters-label">
                      Active Filters:
                    </span>
                    <div className="filter-tags">
                      {selectedCategory !== "all" && (
                        <button
                          className="filter-tag"
                          onClick={() => setSelectedCategory("all")}
                          aria-label={`Remove ${selectedCategory} filter`}
                        >
                          {selectedCategory} ✕
                        </button>
                      )}
                      {selectedMaterial !== "all" && (
                        <button
                          className="filter-tag"
                          onClick={() => setSelectedMaterial("all")}
                          aria-label={`Remove ${selectedMaterial} filter`}
                        >
                          {selectedMaterial} ✕
                        </button>
                      )}
                      {sortBy !== "default" && (
                        <button
                          className="filter-tag"
                          onClick={() => setSortBy("default")}
                          aria-label="Remove sort filter"
                        >
                          {sortBy === "price-low"
                            ? "Price: Low-High"
                            : sortBy === "price-high"
                              ? "Price: High-Low"
                              : sortBy === "name-asc"
                                ? "Name: A-Z"
                                : sortBy === "name-desc"
                                  ? "Name: Z-A"
                                  : sortBy === "newest"
                                    ? "Newest First"
                                    : sortBy}{" "}
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Products Grid */}
            <div className={`products-wrapper ${viewMode === "list" ? "list-view" : "grid-view"}`}>
              {filteredAndSortedProducts.length > 0 ? (
                <div
                  className={`product-grid ${viewMode === "list" ? "list-layout" : ""}`}
                  role="list"
                  aria-label="Product list"
                >
                  {filteredAndSortedProducts.map(renderProductCard)}
                </div>
              ) : (
                <div className="no-products-container" role="status">
                  <div className="no-products-icon" aria-hidden="true">🔍</div>
                  <h3 className="no-products-title">No Products Found</h3>
                  <p className="no-products-message">
                    We couldn't find any products matching your filters.
                  </p>
                  <button className="reset-search-btn" onClick={resetFilters}>
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Empty State - No Products at All */}
        {!loading && !error && remainingProducts.length === 0 && (
          <div className="empty-state-container" role="status">
            <div className="empty-state-icon" aria-hidden="true">📦</div>
            <h2 className="empty-state-title">No Products Available</h2>
            <p className="empty-state-message">
              Check back later for new arrivals!
            </p>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && products.length > 0 && pages > 1 && (
          <nav className="pagination-container" aria-label="Pagination">
            <button
              onClick={handlePrevPage}
              disabled={page === 1}
              className="pagination-btn prev-btn"
              aria-label="Go to previous page"
            >
              <span className="btn-icon" aria-hidden="true">←</span>
              <span className="btn-text">Previous</span>
            </button>

            <div className="pagination-info" aria-live="polite">
              <span className="current-page">{page}</span>
              <span className="page-separator">of</span>
              <span className="total-pages">{pages}</span>
            </div>

            <button
              onClick={handleNextPage}
              disabled={page === pages}
              className="pagination-btn next-btn"
              aria-label="Go to next page"
            >
              <span className="btn-text">Next</span>
              <span className="btn-icon" aria-hidden="true">→</span>
            </button>
          </nav>
        )}
      </main>

      {/* Quick View Modal */}
      {quickViewOpen && quickViewProduct && (
        <>
          <div 
            className="quick-view-backdrop"
            onClick={closeQuickView}
            aria-label="Close quick view"
          />
          <div 
            className="quick-view-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="quick-view-title"
          >
            <button
              className="quick-view-close"
              onClick={closeQuickView}
              aria-label="Close quick view"
            >
              ×
            </button>
            <div className="quick-view-content">
              <div className="quick-view-image">
                {quickViewProduct.image ? (
                  <img src={quickViewProduct.image} alt={quickViewProduct.name} />
                ) : (
                  <div className="no-image-placeholder">No Image Available</div>
                )}
              </div>
              <div className="quick-view-details">
                <div className="quick-view-category">
                  {quickViewProduct.category || "Uncategorized"}
                </div>
                <h2 id="quick-view-title" className="quick-view-title">
                  {quickViewProduct.name}
                </h2>
                <div className="quick-view-price">
                  <span className="current-price">
                    {formatPrice(quickViewProduct.price)}
                  </span>
                  {quickViewProduct.originalPrice && 
                   quickViewProduct.originalPrice > quickViewProduct.price && (
                    <span className="original-price">
                      {formatPrice(quickViewProduct.originalPrice)}
                    </span>
                  )}
                </div>
                {quickViewProduct.description && (
                  <p className="quick-view-description">
                    {quickViewProduct.description}
                  </p>
                )}
                <div className="quick-view-meta">
                  {quickViewProduct.material && (
                    <div className="meta-item">
                      <strong>Material:</strong> {quickViewProduct.material}
                    </div>
                  )}
                  {quickViewProduct.fabric && (
                    <div className="meta-item">
                      <strong>Fabric:</strong> {quickViewProduct.fabric}
                    </div>
                  )}
                  {quickViewProduct.soldOut && (
                    <div className="meta-item sold-out-notice">
                      ⚠️ Currently Sold Out
                    </div>
                  )}
                </div>
                <div className="quick-view-actions">
                  <button
                    className="quick-view-add-to-cart"
                    onClick={() => {
                      addToCart(quickViewProduct);
                      closeQuickView();
                    }}
                    disabled={quickViewProduct.soldOut}
                  >
                    {quickViewProduct.soldOut ? "Sold Out" : "Add to Cart"}
                  </button>
                  <button
                    className="quick-view-wishlist"
                    onClick={() => toggleWishlist(quickViewProduct._id || quickViewProduct.id)}
                    aria-label={
                      wishlist.includes(quickViewProduct._id || quickViewProduct.id)
                        ? "Remove from wishlist"
                        : "Add to wishlist"
                    }
                  >
                    {wishlist.includes(quickViewProduct._id || quickViewProduct.id)
                      ? "❤️ Remove from Wishlist"
                      : "🤍 Add to Wishlist"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Cart Sidebar */}
      <aside 
        className={`cart-sidebar ${cartOpen ? "open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        <div className="cart-header">
          <h2 id="cart-title">Your Cart ({cartItemCount})</h2>
          <button
            className="close-cart"
            aria-label="Close cart"
            onClick={() => setCartOpen(false)}
          >
            ×
          </button>
        </div>
        <div className="cart-items">
          {cartItems.length === 0 ? (
            <p className="empty-cart-message">Your cart is currently empty.</p>
          ) : (
            <>
              <div className="cart-content">
                {cartItems.map((item) => {
                  const itemId = item._id || item.id;
                  return (
                    <article key={itemId} className="cart-item">
                      <div className="cart-item-image">
                        {item.image ? (
                          <img src={item.image} alt={item.name} />
                        ) : (
                          <div className="no-image-placeholder">No Image</div>
                        )}
                      </div>
                      <div className="cart-item-details">
                        <h4 className="cart-item-name">{item.name}</h4>
                        <p className="cart-item-category">{item.category}</p>
                        <p className="cart-item-price">
                          {formatPrice(item.price)}
                        </p>
                        <div className="cart-item-actions">
                          <div className="quantity-controls" role="group" aria-label="Quantity controls">
                            <button
                              onClick={() =>
                                updateQuantity(itemId, item.quantity - 1)
                              }
                              className="quantity-btn"
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>
                            <span className="quantity-display" aria-live="polite">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(itemId, item.quantity + 1)
                              }
                              className="quantity-btn"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(itemId)}
                            className="remove-btn"
                            aria-label={`Remove ${item.name} from cart`}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
              <div className="cart-footer">
                <div className="cart-total">
                  <span>Total:</span>
                  <span aria-live="polite">{formatPrice(cartTotal)}</span>
                </div>
                <button className="checkout-btn" onClick={handleCheckout}>
                  Proceed to Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </aside>

      {cartOpen && (
        <div
          className="cart-backdrop"
          onClick={() => setCartOpen(false)}
          aria-label="Close cart"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setCartOpen(false);
            }
          }}
        />
      )}

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <section className="recently-viewed" aria-labelledby="recently-viewed-title">
          <h2 id="recently-viewed-title">Recently Viewed</h2>
          <div className="product-grid">
            {recentlyViewed.map(renderProductCard)}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;