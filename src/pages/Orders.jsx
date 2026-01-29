import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { ThemeContext } from "../contexts/ThemeContext";
import { getOrders } from "../api/orders";
import "./Order.css";

const Orders = () => {
  const { user } = useContext(AuthContext);
  const { isDark } = useContext(ThemeContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getOrders(user.token);
        setOrders(data.orders || data || []);
        setError("");
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err.message || "Failed to load orders. Please try again later.");
        // Fallback to empty array on error
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const formatPrice = (price) => `₹${Number(price).toLocaleString("en-IN")}`;

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Delivered': isDark ? '#81c784' : '#4CAF50',
      'Shipped': isDark ? '#64b5f6' : '#2196F3',
      'Processing': isDark ? '#ffb74d' : '#FF9800',
      'Cancelled': isDark ? '#e57373' : '#f44336',
      'Pending': isDark ? '#b0b0b0' : '#666'
    };
    return colors[status] || (isDark ? '#b0b0b0' : '#666');
  };

  const getStatusBgColor = (status) => {
    const colors = {
      'Delivered': isDark ? 'rgba(129, 199, 132, 0.1)' : 'rgba(76, 175, 80, 0.1)',
      'Shipped': isDark ? 'rgba(100, 181, 246, 0.1)' : 'rgba(33, 150, 243, 0.1)',
      'Processing': isDark ? 'rgba(255, 183, 77, 0.1)' : 'rgba(255, 152, 0, 0.1)',
      'Cancelled': isDark ? 'rgba(229, 115, 115, 0.1)' : 'rgba(244, 67, 54, 0.1)',
      'Pending': isDark ? 'rgba(176, 176, 176, 0.1)' : 'rgba(102, 102, 102, 0.1)'
    };
    return colors[status] || (isDark ? 'rgba(176, 176, 176, 0.1)' : 'rgba(102, 102, 102, 0.1)');
  };

  const handleReorder = async (orderId) => {
    try {
      // Implement reorder logic
      console.log("Reordering:", orderId);
      alert("Reorder functionality will be implemented soon!");
    } catch (err) {
      console.error("Error reordering:", err);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Error Loading Orders</h2>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-container">
        <div className="empty-orders">
          <div className="empty-orders-icon">🔒</div>
          <h2>Please Login</h2>
          <p>You need to be logged in to view your orders.</p>
          <Link to="/login" className="btn btn-primary">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="page-container">
        <div className="empty-orders">
          <div className="empty-orders-icon">📦</div>
          <h2>No orders yet</h2>
          <p>Start shopping to see your orders here.</p>
          <Link to="/collections/all-shirts" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container orders-page">
      <div className="page-header">
        <div>
          <h1>My Orders</h1>
          <p className="orders-count">
            {orders.length} {orders.length === 1 ? 'order' : 'orders'}
          </p>
        </div>
      </div>

      <div className="orders-list">
        {orders.map((order) => (
          <div key={order._id} className="order-card">
            <div className="order-header">
              <div className="order-info">
                <h3>{order.orderNumber || `Order #${order._id?.slice(-8)}`}</h3>
                <p>Placed on {formatDate(order.createdAt || order.date)}</p>
              </div>
              <div 
                className="order-status" 
                style={{ 
                  color: getStatusColor(order.status),
                  background: getStatusBgColor(order.status)
                }}
              >
                {order.status}
              </div>
            </div>

            <div className="order-items">
              {(order.items || []).map((item, index) => (
                <div key={index} className="order-item">
                  <div className="order-item-details">
                    <span className="item-name">
                      {item.product?.name || item.name || "Product"}
                    </span>
                    {item.size && (
                      <span className="item-size">Size: {item.size}</span>
                    )}
                  </div>
                  <span className="item-quantity">Qty: {item.quantity || 1}</span>
                  <span className="item-price">
                    {formatPrice(item.product?.price || item.price || 0)}
                  </span>
                </div>
              ))}
            </div>

            <div className="order-footer">
              <div className="order-total">
                <span>Total:</span>
                <span className="total-amount">
                  {formatPrice(order.totalAmount || order.total || 0)}
                </span>
              </div>
              <div className="order-actions">
                <Link 
                  to={`/orders/${order._id}`} 
                  className="btn btn-outline btn-sm"
                >
                  View Details
                </Link>
                {(order.status === 'Delivered' || order.status === 'Cancelled') && (
                  <button 
                    onClick={() => handleReorder(order._id)}
                    className="btn btn-outline btn-sm"
                  >
                    Reorder
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;