import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { ThemeContext } from "../contexts/ThemeContext";
import { getProfile } from "../api/users";
import { createOrder } from "../api/orders";
import "./Checkout.css";

const Checkout = () => {
  const { user } = useContext(AuthContext);
  const { isDark } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review

  // Form data
  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India"
  });

  const [paymentMethod, setPaymentMethod] = useState("razorpay"); // razorpay, cod, upi

  // Fetch cart
  useEffect(() => {
    const fetchCart = async () => {
      if (!user?.token) {
        navigate("/login");
        return;
      }

      try {
        const res = await getProfile(user.token);
        const userCart = res.data.cart || [];
        
        if (userCart.length === 0) {
          navigate("/cart");
          return;
        }

        setCart(userCart);
        
        // Pre-fill user info
        if (res.data.name) setShippingInfo(prev => ({ ...prev, fullName: res.data.name }));
        if (res.data.email) setShippingInfo(prev => ({ ...prev, email: res.data.email }));
        
      } catch (err) {
        console.error("Error fetching cart:", err);
        setError("Failed to load cart");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [user, navigate]);

  // Calculate totals
  const calculateSubtotal = () => {
    return cart.reduce((total, item) => {
      const price = item.product?.price || 0;
      const quantity = item.quantity || 1;
      return total + price * quantity;
    }, 0);
  };

  const formatPrice = (price) => {
    return `₹${Number(price).toLocaleString("en-IN")}`;
  };

  const subtotal = calculateSubtotal();
  const shipping = subtotal > 999 ? 0 : 99;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  // Validate shipping info
  const validateShipping = () => {
    const required = ["fullName", "email", "phone", "address", "city", "state", "pincode"];
    const missing = required.filter(field => !shippingInfo[field]);
    
    if (missing.length > 0) {
      setError(`Please fill in: ${missing.join(", ")}`);
      return false;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shippingInfo.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    // Validate phone
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(shippingInfo.phone)) {
      setError("Please enter a valid 10-digit phone number");
      return false;
    }

    // Validate pincode
    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(shippingInfo.pincode)) {
      setError("Please enter a valid 6-digit pincode");
      return false;
    }

    setError("");
    return true;
  };

  // Handle next step
  const handleNext = () => {
    if (step === 1) {
      if (validateShipping()) {
        setStep(2);
      }
    } else if (step === 2) {
      setStep(3);
    }
  };

  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Handle Razorpay payment
  const handleRazorpayPayment = async (orderId) => {
    const res = await loadRazorpayScript();

    if (!res) {
      alert("Razorpay SDK failed to load. Please check your connection.");
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || "YOUR_RAZORPAY_KEY_ID", // Replace with your key
      amount: total * 100, // Amount in paise
      currency: "INR",
      name: "Eleven Brothers",
      description: "Order Payment",
      order_id: orderId,
      handler: async function (response) {
        try {
          // Verify payment on backend
          const verifyResponse = await fetch("/api/orders/verify-payment", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          if (verifyResponse.ok) {
            navigate("/order-success");
          } else {
            setError("Payment verification failed");
          }
        } catch (err) {
          console.error("Payment verification error:", err);
          setError("Payment verification failed");
        }
      },
      prefill: {
        name: shippingInfo.fullName,
        email: shippingInfo.email,
        contact: shippingInfo.phone,
      },
      theme: {
        color: isDark ? "#ffffff" : "#000000",
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();
  };

  // Handle order placement
  const handlePlaceOrder = async () => {
    setProcessing(true);
    setError("");

    try {
      // Create order
      const orderData = {
        items: cart.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          size: item.size,
          price: item.product.price,
        })),
        shippingAddress: shippingInfo,
        paymentMethod,
        totalAmount: total,
        subtotal,
        shipping,
        tax,
      };

      const response = await createOrder(orderData, user.token);

      if (paymentMethod === "razorpay") {
        // Initiate Razorpay payment
        await handleRazorpayPayment(response.razorpayOrderId || response.order._id);
      } else if (paymentMethod === "cod") {
        // Cash on Delivery - directly go to success
        navigate("/order-success");
      } else if (paymentMethod === "upi") {
        // UPI payment logic
        alert("UPI payment will be implemented soon!");
      }

    } catch (err) {
      console.error("Order placement error:", err);
      setError(err.message || "Failed to place order. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!user || cart.length === 0) {
    return null;
  }

  return (
    <div className="page-container checkout-page">
      <div className="checkout-header">
        <h1>Checkout</h1>
        <div className="checkout-steps">
          <div className={`step ${step >= 1 ? "active" : ""} ${step > 1 ? "completed" : ""}`}>
            <span className="step-number">1</span>
            <span className="step-label">Shipping</span>
          </div>
          <div className="step-divider"></div>
          <div className={`step ${step >= 2 ? "active" : ""} ${step > 2 ? "completed" : ""}`}>
            <span className="step-number">2</span>
            <span className="step-label">Payment</span>
          </div>
          <div className="step-divider"></div>
          <div className={`step ${step >= 3 ? "active" : ""}`}>
            <span className="step-number">3</span>
            <span className="step-label">Review</span>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="checkout-layout">
        <div className="checkout-main">
          {/* Step 1: Shipping Information */}
          {step === 1 && (
            <div className="checkout-section">
              <h2>Shipping Information</h2>
              <form className="checkout-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={shippingInfo.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={shippingInfo.email}
                      onChange={handleInputChange}
                      placeholder="your.email@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={shippingInfo.phone}
                    onChange={handleInputChange}
                    placeholder="10-digit mobile number"
                    maxLength="10"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Address *</label>
                  <textarea
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleInputChange}
                    placeholder="House no., Street name, Area"
                    rows="3"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>City *</label>
                    <input
                      type="text"
                      name="city"
                      value={shippingInfo.city}
                      onChange={handleInputChange}
                      placeholder="City"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>State *</label>
                    <input
                      type="text"
                      name="state"
                      value={shippingInfo.state}
                      onChange={handleInputChange}
                      placeholder="State"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      value={shippingInfo.pincode}
                      onChange={handleInputChange}
                      placeholder="6-digit pincode"
                      maxLength="6"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Country</label>
                    <input
                      type="text"
                      name="country"
                      value={shippingInfo.country}
                      disabled
                    />
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Step 2: Payment Method */}
          {step === 2 && (
            <div className="checkout-section">
              <h2>Payment Method</h2>
              <div className="payment-methods">
                <label className={`payment-option ${paymentMethod === "razorpay" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="razorpay"
                    checked={paymentMethod === "razorpay"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-option-content">
                    <span className="payment-icon">💳</span>
                    <div>
                      <strong>Credit/Debit Card / UPI / Netbanking</strong>
                      <p>Secure payment via Razorpay</p>
                    </div>
                  </div>
                </label>

                <label className={`payment-option ${paymentMethod === "cod" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div className="payment-option-content">
                    <span className="payment-icon">💵</span>
                    <div>
                      <strong>Cash on Delivery</strong>
                      <p>Pay when you receive</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Step 3: Review Order */}
          {step === 3 && (
            <div className="checkout-section">
              <h2>Review Your Order</h2>
              
              <div className="review-section">
                <h3>Shipping Address</h3>
                <div className="review-details">
                  <p><strong>{shippingInfo.fullName}</strong></p>
                  <p>{shippingInfo.address}</p>
                  <p>{shippingInfo.city}, {shippingInfo.state} - {shippingInfo.pincode}</p>
                  <p>{shippingInfo.country}</p>
                  <p>Phone: {shippingInfo.phone}</p>
                  <p>Email: {shippingInfo.email}</p>
                  <button onClick={() => setStep(1)} className="btn-link">Edit</button>
                </div>
              </div>

              <div className="review-section">
                <h3>Payment Method</h3>
                <div className="review-details">
                  <p>
                    {paymentMethod === "razorpay" && "Credit/Debit Card / UPI / Netbanking"}
                    {paymentMethod === "cod" && "Cash on Delivery"}
                  </p>
                  <button onClick={() => setStep(2)} className="btn-link">Edit</button>
                </div>
              </div>

              <div className="review-section">
                <h3>Order Items</h3>
                <div className="review-items">
                  {cart.map((item) => (
                    <div key={item._id} className="review-item">
                      <img 
                        src={item.product?.image} 
                        alt={item.product?.name}
                        className="review-item-image"
                      />
                      <div className="review-item-details">
                        <p><strong>{item.product?.name}</strong></p>
                        {item.size && <p>Size: {item.size}</p>}
                        <p>Qty: {item.quantity}</p>
                      </div>
                      <div className="review-item-price">
                        {formatPrice(item.product?.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="checkout-actions">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="btn btn-outline"
                disabled={processing}
              >
                ← Back
              </button>
            )}
            
            {step < 3 ? (
              <button
                onClick={handleNext}
                className="btn btn-primary"
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={handlePlaceOrder}
                className="btn btn-primary"
                disabled={processing}
              >
                {processing ? "Processing..." : `Place Order - ${formatPrice(total)}`}
              </button>
            )}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="checkout-sidebar">
          <div className="order-summary">
            <h3>Order Summary</h3>
            
            <div className="summary-items">
              {cart.map((item) => (
                <div key={item._id} className="summary-item">
                  <span>{item.product?.name} × {item.quantity}</span>
                  <span>{formatPrice(item.product?.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? <span className="free-badge">FREE</span> : formatPrice(shipping)}</span>
            </div>

            <div className="summary-row">
              <span>Tax (GST 18%)</span>
              <span>{formatPrice(tax)}</span>
            </div>

            <div className="summary-divider"></div>

            <div className="summary-row summary-total">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;