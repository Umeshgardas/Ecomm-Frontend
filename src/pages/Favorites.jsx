import { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import "./Favorites.css";

const Favorites = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState({});

  // Fetch favorites
  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user?.token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/users/profile', {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to load profile');
        }
        
        const data = await response.json();
        console.log("Favorites data:", data.favorites); // Debug log
        
        // Check if favorites is an array
        if (Array.isArray(data.favorites)) {
          setFavorites(data.favorites);
        } else if (data.favorites && typeof data.favorites === 'object') {
          // If it's an object with nested array
          setFavorites(data.favorites.items || []);
        } else {
          setFavorites([]);
        }
        setError("");
      } catch (err) {
        console.error("Favorites fetch error:", err);
        setError("Failed to load favorites");
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user]);

  // Show notification helper
  const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#333'};
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  };

  // Remove from favorites
  const removeFavorite = async (productId) => {
    const productName = favorites.find((fav) => fav._id === productId)?.name;

    // Optimistic update
    const previousFavorites = [...favorites];
    setFavorites(favorites.filter((fav) => fav._id !== productId));

    setActionLoading((prev) => ({ ...prev, [productId]: true }));

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

      // Update favorites from response
      setFavorites(data.favorites || []);
      setError("");
      showNotification(
        `${productName || "Item"} removed from favorites`,
        "success",
      );
    } catch (err) {
      console.error("Error removing from favorites:", err);
      setFavorites(previousFavorites); // Revert on error
      setError(err.message || "Failed to remove from favorites");
      showNotification(
        err.message || "Failed to remove from favorites",
        "error",
      );
      setTimeout(() => setError(""), 3000);
    } finally {
      setActionLoading((prev) => ({ ...prev, [productId]: false }));
    }
  };

  // Add to cart from favorites
  const addToCart = async (product) => {
    setActionLoading((prev) => ({ ...prev, [`cart-${product._id}`]: true }));

    try {
      const response = await fetch("/api/users/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: 1,
          size: "M",
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to add to cart");
      }

      setError("");
      showNotification(`${product.name} added to cart!`, "success");
    } catch (err) {
      console.error("Error adding to cart:", err);
      setError(err.message || "Failed to add to cart");
      showNotification(err.message || "Failed to add to cart", "error");
      setTimeout(() => setError(""), 3000);
    } finally {
      setActionLoading((prev) => ({ ...prev, [`cart-${product._id}`]: false }));
    }
  };

  // Move all to cart
  const moveAllToCart = async () => {
    if (favorites.length === 0) return;

    setLoading(true);
    const successItems = [];
    const failedItems = [];

    for (const product of favorites) {
      try {
        const response = await fetch("/api/users/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            productId: product._id,
            quantity: 1,
            size: "M",
          }),
        });

        if (response.ok) {
          successItems.push(product.name);
        } else {
          failedItems.push(product.name);
        }
      } catch (err) {
        console.error("Error adding to cart:", err);
        failedItems.push(product.name);
      }
    }

    setLoading(false);

    if (successItems.length > 0) {
      showNotification(`${successItems.length} item(s) added to cart!`, "success");
      setTimeout(() => navigate("/cart"), 1500);
    }

    if (failedItems.length > 0) {
      const errorMsg = `Failed to add ${failedItems.length} item(s) to cart`;
      setError(errorMsg);
      showNotification(errorMsg, "error");
    }
  };

  const formatPrice = (price) => {
    return `₹${Number(price).toLocaleString("en-IN")}`;
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your favorites...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-container">
        <div className="empty-favorites">
          <div className="empty-favorites-icon">❤️</div>
          <h2>Please Login</h2>
          <p>You need to be logged in to view your favorites.</p>
          <Link to="/login" className="btn btn-primary">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="page-container">
        <div className="empty-favorites">
          <div className="empty-favorites-icon">❤️</div>
          <h2>No favorites yet</h2>
          <p>Start adding products to your wishlist to see them here.</p>
          <Link to="/collections/all-shirts" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container favorites-page">
      {/* Debug info - remove in production */}
      <div style={{ display: 'none' }}>
        <p>Favorites count: {favorites.length}</p>
        <p>First favorite: {JSON.stringify(favorites[0])}</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="alert alert-error" style={{ marginBottom: "20px" }}>
          {error}
        </div>
      )}

      <div className="page-header">
        <div>
          <h1>My Favorites</h1>
          <p>
            {favorites.length} {favorites.length === 1 ? "item" : "items"} in
            your wishlist
          </p>
        </div>
        <button
          onClick={moveAllToCart}
          className="btn btn-primary"
          disabled={loading || favorites.length === 0}
        >
          {loading ? "Adding..." : "Move All to Cart"}
        </button>
      </div>

      <div className="favorites-grid">
        {favorites.map((product) => (
          <div key={product._id} className="favorite-card">
            {/* Remove Button */}
            <button
              className="remove-favorite-btn"
              onClick={() => removeFavorite(product._id)}
              aria-label="Remove from favorites"
              disabled={actionLoading[product._id]}
            >
              {actionLoading[product._id] ? "⏳" : "❤️"}
            </button>

            {/* Product Image */}
            <Link to={`/products/${product._id}`} className="favorite-image">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className="product-image-placeholder"
                style={{ display: product.image ? "none" : "flex" }}
              >
                {product.name?.charAt(0) || "P"}
              </div>

              {/* Discount Badge */}
              {product.originalPrice &&
                product.originalPrice > product.price && (
                  <div className="discount-badge-fav">
                    {Math.round(
                      ((product.originalPrice - product.price) /
                        product.originalPrice) *
                        100,
                    )}
                    % OFF
                  </div>
                )}

              {/* Sold Out Badge */}
              {(product.soldOut ||
                (product.stock !== undefined && product.stock === 0)) && (
                <div className="sold-out-badge-fav">Sold Out</div>
              )}
            </Link>

            {/* Product Info */}
            <div className="favorite-info">
              <p className="favorite-category">{product.category || "Shirt"}</p>
              <h3 className="favorite-name">
                <Link to={`/products/${product._id}`}>
                  {product.name || "Product"}
                </Link>
              </h3>

              <div className="favorite-price">
                <span className="current-price">
                  {formatPrice(product.price || 0)}
                </span>
                {product.originalPrice &&
                  product.originalPrice > product.price && (
                    <span className="original-price">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
              </div>

              {/* Stock Status */}
              {product.stock !== undefined && (
                <p
                  className={`stock-status-fav ${product.stock > 0 ? "in-stock" : "out-of-stock"}`}
                >
                  {product.stock > 0
                    ? `${product.stock} in stock`
                    : "Out of stock"}
                </p>
              )}

              {/* Action Buttons */}
              <div className="favorite-actions">
                <button
                  className="btn btn-primary add-to-cart-btn-fav"
                  onClick={() => addToCart(product)}
                  disabled={
                    actionLoading[`cart-${product._id}`] ||
                    product.soldOut ||
                    product.stock === 0
                  }
                >
                  {actionLoading[`cart-${product._id}`]
                    ? "Adding..."
                    : product.soldOut || product.stock === 0
                      ? "Out of Stock"
                      : "Add to Cart"}
                </button>

                <Link
                  to={`/products/${product._id}`}
                  className="btn btn-outline view-details-btn"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Share Wishlist */}
      <div className="wishlist-footer">
        <button
          className="btn btn-outline"
          onClick={() => {
            const url = window.location.href;
            navigator.clipboard.writeText(url);
            showNotification("Wishlist link copied to clipboard!", "success");
          }}
        >
          📋 Share Wishlist
        </button>
      </div>
    </div>
  );
};

export default Favorites;