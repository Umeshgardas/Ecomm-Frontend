import { useEffect, useState, useContext, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProfile } from "../api/users";
import { AuthContext } from "../contexts/AuthContext";
import { ThemeContext } from "../contexts/ThemeContext";
import "./Cart.css";

const Cart = () => {
  const { user } = useContext(AuthContext);
  const { isDark } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingItems, setUpdatingItems] = useState(new Set());
  
  console.log("Cart data:", cart);
  console.log("Cart items:", cart.map(item => ({
    id: item._id,
    product: item.product,
    productName: item.product?.name,
    productPrice: item.product?.price
  })));

  // Fetch cart data
  useEffect(() => {
    const fetchCart = async () => {
      if (!user?.token) {
        setLoading(false);
        return;
      }

      try {
        const res = await getProfile(user.token);
        console.log("Profile response:", res);
        console.log("Cart from API:", res.data.cart);
        
        // Ensure cart data is properly set
        const cartData = res.data.cart || [];
        setCart(cartData);
        setError("");
      } catch (err) {
        setError("Failed to load cart");
        console.error("Cart fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [user]);

  // Update quantity - use PATCH /api/users/cart
  const updateQuantity = useCallback(
    async (itemId, newQuantity) => {
      if (newQuantity < 1) {
        removeItem(itemId);
        return;
      }

      // Optimistic update
      const previousCart = [...cart];
      setCart(
        cart.map((item) =>
          item._id === itemId ? { ...item, quantity: newQuantity } : item,
        ),
      );

      setUpdatingItems((prev) => new Set(prev).add(itemId));

      try {
        const response = await fetch("/api/users/cart", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            itemId,
            quantity: newQuantity,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to update cart");
        }

        const data = await response.json();
        console.log("Update response:", data);
        setCart(data.cart || cart);
        setError("");
      } catch (err) {
        console.error("Error updating quantity:", err);
        setCart(previousCart);
        setError(err.message || "Failed to update quantity. Please try again.");
        setTimeout(() => setError(""), 3000);
      } finally {
        setUpdatingItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      }
    },
    [cart, user],
  );

  // Remove item - use DELETE /api/users/cart/:itemId
  const removeItem = useCallback(
    async (itemId) => {
      // Optimistic update
      const previousCart = [...cart];
      const itemToRemove = cart.find((item) => item._id === itemId);
      setCart(cart.filter((item) => item._id !== itemId));

      setUpdatingItems((prev) => new Set(prev).add(itemId));

      try {
        const response = await fetch(`/api/users/cart/${itemId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to remove item");
        }

        const data = await response.json();
        console.log("Remove response:", data);
        setCart(data.cart || []);
        setError("");

        // Show success notification
        showNotification(
          `${itemToRemove?.product?.name || "Item"} removed from cart`,
          "success",
        );
      } catch (err) {
        console.error("Error removing item:", err);
        setCart(previousCart);
        setError(err.message || "Failed to remove item. Please try again.");
        setTimeout(() => setError(""), 3000);
      } finally {
        setUpdatingItems((prev) => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      }
    },
    [cart, user],
  );

  // Clear cart - use DELETE /api/users/cart/clear
  const clearCart = useCallback(async () => {
    if (!window.confirm("Are you sure you want to clear your cart?")) {
      return;
    }

    const previousCart = [...cart];
    setCart([]);
    setUpdatingItems(new Set(["all"]));

    try {
      const response = await fetch("/api/users/cart/clear", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to clear cart");
      }

      const data = await response.json();
      console.log("Clear cart response:", data);
      
      setCart([]);
      setError("");
      showNotification("Cart cleared successfully", "success");
    } catch (err) {
      console.error("Error clearing cart:", err);
      setCart(previousCart);
      setError(err.message || "Failed to clear cart. Please try again.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setUpdatingItems(new Set());
    }
  }, [cart, user]);

  // Show notification helper - now theme-aware
  const showNotification = (message, type = "info") => {
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Theme-aware colors
    const bgColor =
      type === "success"
        ? isDark
          ? "#81c784"
          : "#4CAF50"
        : isDark
          ? "#424242"
          : "#333";

    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: ${bgColor};
      color: ${isDark ? "#000" : "#fff"};
      padding: 12px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,${isDark ? "0.6" : "0.2"});
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease";
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  };

  // Calculate totals
  const calculateSubtotal = useCallback(() => {
    return cart.reduce((total, item) => {
      const price = item.product?.price || 0;
      const quantity = item.quantity || 1;
      return total + price * quantity;
    }, 0);
  }, [cart]);

  const formatPrice = useCallback((price) => {
    return `₹${Number(price).toLocaleString("en-IN")}`;
  }, []);

  const subtotal = calculateSubtotal();
  const shipping = subtotal > 999 ? 0 : 99;
  const tax = Math.round(subtotal * 0.18); // 18% GST
  const total = subtotal + shipping + tax;
  const isUpdating = updatingItems.size > 0;

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-container">
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h2>Please Login</h2>
          <p>You need to be logged in to view your cart.</p>
          <Link to="/login" className="btn btn-primary">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="page-container">
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <Link to="/collections/all-shirts" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container cart-page">
      {/* Error Display */}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="page-header">
        <div>
          <h1>Shopping Cart</h1>
          <p className="cart-count">
            {cart.length} {cart.length === 1 ? "item" : "items"} in your cart
          </p>
        </div>
        <button
          onClick={clearCart}
          className="clear-cart-btn"
          disabled={isUpdating}
        >
          {updatingItems.has("all") ? "Clearing..." : "Clear Cart"}
        </button>
      </div>

      <div className="cart-layout">
        {/* Cart Items */}
        <div className="cart-items">
          {cart.map((item) => {
            const itemUpdating = updatingItems.has(item._id);
            const productName = item.product?.name || "Product Name Unavailable";
            const productPrice = item.product?.price || 0;
            const productId = item.product?._id || item.product;

            console.log("Rendering item:", {
              itemId: item._id,
              productName,
              productPrice,
              productId,
              fullProduct: item.product
            });

            return (
              <div
                key={item._id}
                className={`cart-item ${itemUpdating ? "updating" : ""}`}
              >
                {/* Product Image */}
                <Link
                  to={`/products/${productId}`}
                  className="cart-item-image"
                >
                  {item.product?.image ? (
                    <img
                      src={item.product.image}
                      alt={productName}
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className="product-image-placeholder"
                    style={{ display: item.product?.image ? "none" : "flex" }}
                  >
                    {productName.charAt(0) || "P"}
                  </div>
                </Link>

                {/* Product Details */}
                <div className="cart-item-details">
                  <Link to={`/products/${productId}`}>
                    <h3 className="cart-item-name">
                      {productName}
                    </h3>
                  </Link>
                  <p className="cart-item-category">
                    {item.product?.category || "Shirt"}
                  </p>
                  {item.size && (
                    <p className="cart-item-size">
                      Size: <strong>{item.size}</strong>
                    </p>
                  )}
                  <p className="cart-item-price">
                    {formatPrice(productPrice)} each
                  </p>

                  {/* Stock warning */}
                  {item.product?.stock !== undefined &&
                    item.quantity > item.product.stock && (
                      <p className="stock-warning">
                        ⚠️ Only {item.product.stock} left in stock
                      </p>
                    )}
                </div>

                {/* Quantity Controls */}
                <div className="cart-item-actions">
                  <div className="quantity-controls">
                    <button
                      onClick={() =>
                        updateQuantity(item._id, (item.quantity || 1) - 1)
                      }
                      className="quantity-btn"
                      aria-label="Decrease quantity"
                      disabled={itemUpdating || item.quantity <= 1}
                    >
                      −
                    </button>
                    <span className="quantity-value">{item.quantity || 1}</span>
                    <button
                      onClick={() =>
                        updateQuantity(item._id, (item.quantity || 1) + 1)
                      }
                      className="quantity-btn"
                      aria-label="Increase quantity"
                      disabled={
                        itemUpdating ||
                        (item.product?.stock &&
                          item.quantity >= item.product.stock)
                      }
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item._id)}
                    className="remove-btn"
                    aria-label="Remove item"
                    disabled={itemUpdating}
                  >
                    {itemUpdating ? "⏳ Removing..." : "🗑️ Remove"}
                  </button>
                </div>

                {/* Item Total */}
                <div className="cart-item-total">
                  <span className="total-label">Total:</span>
                  <span className="total-price">
                    {formatPrice(productPrice * (item.quantity || 1))}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <h2>Order Summary</h2>

          <div className="summary-row">
            <span>
              Subtotal ({cart.length} {cart.length === 1 ? "item" : "items"})
            </span>
            <span className="summary-value">{formatPrice(subtotal)}</span>
          </div>

          <div className="summary-row">
            <span>Shipping</span>
            <span className="summary-value">
              {shipping === 0 ? (
                <span className="free-badge">FREE</span>
              ) : (
                formatPrice(shipping)
              )}
            </span>
          </div>

          <div className="summary-row">
            <span>Tax (GST 18%)</span>
            <span className="summary-value">{formatPrice(tax)}</span>
          </div>

          {shipping > 0 && subtotal > 0 && subtotal < 999 && (
            <div className="shipping-notice">
              🎁 Add {formatPrice(999 - subtotal)} more for FREE shipping!
            </div>
          )}

          <div className="summary-divider"></div>

          <div className="summary-row summary-total">
            <span>Total</span>
            <span className="summary-value">{formatPrice(total)}</span>
          </div>

          <button
            className="btn btn-primary checkout-btn"
            disabled={isUpdating || cart.length === 0}
            onClick={() => navigate("/checkout")}
          >
            {isUpdating ? "Processing..." : "Proceed to Checkout"}
          </button>

          <Link to="/collections/all-shirts" className="continue-shopping">
            ← Continue Shopping
          </Link>

          {/* Promo Code Section */}
          <div className="promo-code-section">
            <h3>Have a promo code?</h3>
            <div className="promo-input-group">
              <input
                type="text"
                placeholder="Enter code"
                className="promo-input"
              />
              <button className="apply-promo-btn">Apply</button>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="trust-badges">
            <div className="trust-badge">
              <span>🔒</span>
              <p>Secure Checkout</p>
            </div>
            <div className="trust-badge">
              <span>🚚</span>
              <p>Fast Delivery</p>
            </div>
            <div className="trust-badge">
              <span>↩️</span>
              <p>Easy Returns</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;