import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext"; // Added import
import "./ProductCard.css";

const ProductCard = ({ 
  product, 
  onAddToCart, 
  onToggleWishlist, 
  onQuickView,
  isInWishlist = false 
}) => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { showNotification } = useNotification(); // Added notification hook
  const [imageError, setImageError] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const productId = product._id || product.id;
  
  const formatPrice = (price) => {
    return `₹${Number(price).toLocaleString("en-IN")}`;
  };

  const handleCardClick = () => {
    navigate(`/products/${productId}`);
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    
    if (product.soldOut || (product.stock !== undefined && product.stock === 0)) {
      showNotification("This product is sold out!", { type: "warning" }); // Updated
      return;
    }

    // Check if user is logged in
    if (!user) {
      showNotification("Please login to add to cart", { type: "info" }); // Updated
      navigate('/login');
      return;
    }

    // If parent component provided onAddToCart callback, use it
    if (onAddToCart) {
      onAddToCart(product);
      return;
    }

    // Otherwise, handle add to cart directly with default size M
    setAddingToCart(true);

    try {
      const response = await fetch('/api/users/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          productId: product._id || product.id,
          quantity: 1,
          size: 'M' // Default medium size
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add to cart');
      }

      // Show success feedback - Updated
      showNotification(`${product.name} added to cart! (Size: M)`, { type: "success" });
    } catch (err) {
      console.error("Error adding to cart:", err);
      showNotification(err.message || 'Failed to add to cart', { type: "error" }); // Updated
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    
    if (!user) {
      showNotification("Please login to add to wishlist", { type: "info" }); // Added notification
      navigate('/login');
      return;
    }
    
    if (onToggleWishlist) {
      onToggleWishlist(productId);
    }
  };

  const handleQuickView = (e) => {
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
      showNotification(`Quick view for ${product.name}`, { type: "info", duration: 2000 }); // Added notification
    }
  };

  return (
    <div className="product-card" onClick={handleCardClick}>
      <div className="product-image">
        <div className="image-placeholder">
          {product.image && !imageError ? (
            <img 
              src={product.image} 
              alt={product.name}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="no-image-text">No Image</div>
          )}
          
          {/* Hover Overlay */}
          <div className="image-overlay">
            {onQuickView && (
              <button
                className="quick-view-button"
                onClick={handleQuickView}
              >
                Quick View
              </button>
            )}
            <button
              className="add-to-cart-button"
              disabled={product.soldOut || (product.stock !== undefined && product.stock === 0) || addingToCart}
              onClick={handleAddToCart}
            >
              {addingToCart 
                ? "Adding..." 
                : product.soldOut || (product.stock === 0) 
                  ? "Sold Out" 
                  : "Add to Cart"}
            </button>
          </div>
        </div>
        
        {/* Sold Out Badge */}
        {(product.soldOut || (product.stock !== undefined && product.stock === 0)) && (
          <div className="sold-out-badge">Sold Out</div>
        )}

        {/* Discount Badge */}
        {product.originalPrice && product.originalPrice > product.price && (
          <div className="discount-badge">
            {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
          </div>
        )}
      </div>
      
      <div className="product-info">
        <div className="product-category">
          {product.category || 'Uncategorized'}
        </div>
        <h3 className="product-name">{product.name}</h3>
        <div className="product-price">
          <span className="regular-price">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="original-price">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
        
        {/* Wishlist Button */}
        {onToggleWishlist && (
          <div className="product-actions">
            <button
              className="wishlist-button"
              aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
              onClick={handleWishlistClick}
              disabled={!user} // Disable if user is not logged in
            >
              {isInWishlist ? "❤️" : "🤍"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;