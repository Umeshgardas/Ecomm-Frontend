import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProducts } from "../../api/products";
import "./Dashboard.css";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    availableProducts: 0,
    soldOutProducts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await getProducts();
      const products = res.data.products || res.data || [];
      
      setStats({
        totalProducts: products.length,
        availableProducts: products.filter(p => !p.soldOut).length,
        soldOutProducts: products.filter(p => p.soldOut).length,
      });
    } catch (err) {
      console.error("Failed to load stats:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      
      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-content">
                <h3>{stats.totalProducts}</h3>
                <p>Total Products</p>
              </div>
            </div>
            
            <div className="stat-card available">
              <div className="stat-icon">✓</div>
              <div className="stat-content">
                <h3>{stats.availableProducts}</h3>
                <p>Available</p>
              </div>
            </div>
            
            <div className="stat-card sold-out">
              <div className="stat-icon">✗</div>
              <div className="stat-content">
                <h3>{stats.soldOutProducts}</h3>
                <p>Sold Out</p>
              </div>
            </div>
          </div>

          <div className="quick-actions">
            <h3>Quick Actions</h3>
            <div className="action-buttons">
              <Link to="/admin/products" className="action-btn">
                <span className="icon">📋</span>
                <div>
                  <strong>Manage Products</strong>
                  <p>View, edit, and delete products</p>
                </div>
              </Link>
              
              <Link to="/admin/products/create" className="action-btn">
                <span className="icon">➕</span>
                <div>
                  <strong>Add New Product</strong>
                  <p>Create a new product listing</p>
                </div>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;