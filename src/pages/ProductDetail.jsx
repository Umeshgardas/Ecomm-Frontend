import { useEffect, useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import "./ProductDetail.css";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/products/${id}`);
        
        if (!response.ok) {
          throw new Error('Product not found');
        }
        
        const data = await response.json();
        setProduct(data);
        
        // Check if product is in wishlist
        if (user?.token) {
          checkWishlistStatus(data._id);
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id, user]);

  // Check if product is in user's wishlist
  const checkWishlistStatus = async (productId) => {
    try {
      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const inWishlist = data.favorites?.some(fav => fav._id === productId);
        setIsInWishlist(inWishlist);
      }
    } catch (err) {
      console.error("Error checking wishlist:", err);
    }
  };

  // Add to cart function
  const handleAddToCart = async () => {
    if (!selectedSize) {
      alert("Please select a size");
      return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    setAddingToCart(true);

    try {
      const response = await fetch('/api/users/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          productId: product._id,
          quantity,
          size: selectedSize
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add to cart');
      }

      alert('Product added to cart successfully!');
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert(err.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  // Toggle wishlist function
  const handleToggleWishlist = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setAddingToWishlist(true);

    try {
      const method = isInWishlist ? 'DELETE' : 'POST';
      const response = await fetch(`/api/users/favorites/${product._id}`, {
        method,
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to update wishlist');
      }

      setIsInWishlist(!isInWishlist);
      alert(isInWishlist ? 'Removed from wishlist' : 'Added to wishlist');
    } catch (err) {
      console.error("Error updating wishlist:", err);
      alert(err.message || 'Failed to update wishlist');
    } finally {
      setAddingToWishlist(false);
    }
  };

  const formatPrice = (price) => `₹${Number(price).toLocaleString("en-IN")}`;

  // Loading state
  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading product...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="page-container">
        <div className="alert alert-error">
          {error || 'Product not found'}
        </div>
        <Link to="/collections/all-shirts" className="btn btn-primary">
          Back to Products
        </Link>
      </div>
    );
  }

  // Available sizes - use from product or default
  const availableSizes = product.sizes || product.availableSizes || ["S", "M", "L", "XL", "XXL"];

  return (
    <div className="page-container product-detail-page">
      {/* Breadcrumb Navigation */}
      <nav className="breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/collections/all-shirts">All Shirts</Link>
        <span>/</span>
        {product.category && (
          <>
            <Link to={`/collections/${product.category.toLowerCase().replace(/\s+/g, '-')}`}>
              {product.category}
            </Link>
            <span>/</span>
          </>
        )}
        <span>{product.name}</span>
      </nav>

      <div className="product-detail-grid">
        {/* Product Images */}
        <div className="product-images">
          <div className="product-main-image">
            {product.image || product.images?.[0] ? (
              <img 
                src={product.image || product.images[0]} 
                alt={product.name}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div 
              className="product-image-placeholder"
              style={{ display: product.image || product.images?.[0] ? 'none' : 'flex' }}
            >
              {product.name?.charAt(0) || 'P'}
            </div>
          </div>

          {/* Thumbnail images if available */}
          {product.images && product.images.length > 1 && (
            <div className="product-thumbnails">
              {product.images.slice(0, 4).map((img, index) => (
                <div key={index} className="thumbnail">
                  <img src={img} alt={`${product.name} ${index + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="product-info-section">
          <div className="product-category-badge">
            {product.category || 'Uncategorized'}
          </div>
          
          <h1 className="product-title">{product.name}</h1>
          
          <div className="product-price-section">
            <span className="product-price">{formatPrice(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span className="product-original-price">
                  {formatPrice(product.originalPrice)}
                </span>
                <span className="discount-badge">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                </span>
              </>
            )}
          </div>

          <p className="product-description">
            {product.description || 'No description available.'}
          </p>

          {/* Stock Status */}
          {product.stock !== undefined && (
            <div className="stock-status">
              {product.stock > 0 ? (
                <span className="in-stock">✓ In Stock ({product.stock} available)</span>
              ) : (
                <span className="out-of-stock">✗ Out of Stock</span>
              )}
            </div>
          )}

          {/* Product Options */}
          <div className="product-options">
            <div className="option-group">
              <label>Size {selectedSize && <span className="selected-value">({selectedSize})</span>}</label>
              <div className="size-selector">
                {availableSizes.map(size => (
                  <button
                    key={size}
                    className={`size-button ${selectedSize === size ? 'active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="option-group">
              <label>Quantity</label>
              <div className="quantity-controls">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <span>{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={product.stock && quantity >= product.stock}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Product Actions */}
          <div className="product-actions-section">
            <button 
              className="btn btn-primary add-to-cart-btn-large" 
              onClick={handleAddToCart}
              disabled={!selectedSize || product.soldOut || addingToCart || (product.stock !== undefined && product.stock === 0)}
            >
              {addingToCart ? "Adding..." : product.soldOut || (product.stock === 0) ? "Sold Out" : "Add to Cart"}
            </button>
            <button 
              className="btn btn-outline wishlist-btn-large"
              onClick={handleToggleWishlist}
              disabled={addingToWishlist}
            >
              {addingToWishlist ? "..." : isInWishlist ? "❤️ In Wishlist" : "♥ Add to Wishlist"}
            </button>
          </div>

          {/* Product Features */}
          <div className="product-features">
            <div className="feature">
              <span className="feature-icon">🚚</span>
              <div>
                <strong>Free Shipping</strong>
                <p>On orders over ₹999</p>
              </div>
            </div>
            <div className="feature">
              <span className="feature-icon">↩️</span>
              <div>
                <strong>Easy Returns</strong>
                <p>30-day return policy</p>
              </div>
            </div>
            <div className="feature">
              <span className="feature-icon">✓</span>
              <div>
                <strong>Authentic</strong>
                <p>100% genuine products</p>
              </div>
            </div>
          </div>

          {/* Additional Product Details */}
          {(product.material || product.care || product.details) && (
            <div className="product-details-section">
              <h3>Product Details</h3>
              {product.material && <p><strong>Material:</strong> {product.material}</p>}
              {product.care && <p><strong>Care:</strong> {product.care}</p>}
              {product.details && <p>{product.details}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;