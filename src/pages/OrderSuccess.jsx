import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./OrderSuccess.css";

const OrderSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear cart from localStorage (if you're using it)
    localStorage.removeItem("cart");
  }, []);

  return (
    <div className="page-container order-success-page">
      <div className="success-container">
        <div className="success-icon">
          <div className="checkmark-circle">
            <svg className="checkmark" viewBox="0 0 52 52">
              <circle className="checkmark-circle-path" cx="26" cy="26" r="25" fill="none"/>
              <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
          </div>
        </div>

        <h1>Order Placed Successfully!</h1>
        <p className="success-message">
          Thank you for your purchase. Your order has been confirmed and will be delivered soon.
        </p>

        <div className="order-details-box">
          <h3>What's Next?</h3>
          <ul className="next-steps">
            <li>✅ Order confirmation email has been sent</li>
            <li>📦 Your order is being processed</li>
            <li>🚚 You'll receive tracking details soon</li>
            <li>💬 Contact us for any queries</li>
          </ul>
        </div>

        <div className="success-actions">
          <Link to="/orders" className="btn btn-primary">
            View My Orders
          </Link>
          <Link to="/collections/all-shirts" className="btn btn-outline">
            Continue Shopping
          </Link>
        </div>

        <div className="support-info">
          <p>Need help? Contact us at <a href="mailto:support@elevenbrothers.com">support@elevenbrothers.com</a></p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;