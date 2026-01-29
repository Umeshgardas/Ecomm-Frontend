import { useContext, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { ThemeContext } from "../contexts/ThemeContext";
import "./Profile.css";

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const { toggleTheme, isDark } = useContext(ThemeContext);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    address: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // API call to update profile
    console.log("Update profile:", form);
    setEditing(false);
  };

  return (
    <div className="page-container profile-page">
      <div className="profile-wrapper">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="profile-header-info">
            <h1>Welcome, {user?.name}</h1>
            <p className="user-email">{user?.email}</p>
            {user?.isAdmin && <span className="admin-badge">Admin</span>}
          </div>
        </div>

        {/* Profile Content */}
        <div className="profile-content">
          {/* Theme Settings Section */}
          <div className="profile-section theme-section">
            <div className="section-header">
              <h2>Appearance</h2>
            </div>

            <div className="theme-settings">
              <div className="theme-info">
                <div className="theme-icon">{isDark ? "🌙" : "☀️"}</div>
                <div>
                  <h3>Theme Mode</h3>
                  <p>Customize your visual experience</p>
                </div>
              </div>

              {/* Theme Toggle Switch */}
              <div className="theme-toggle-container">
                <label className="theme-toggle">
                  <input
                    type="checkbox"
                    checked={isDark}
                    onChange={toggleTheme}
                  />
                  <span className="toggle-slider">
                    <span className="toggle-icon light">☀️</span>
                    <span className="toggle-icon dark">🌙</span>
                  </span>
                </label>
                <span className="theme-label">
                  {isDark ? "Dark Mode" : "Light Mode"}
                </span>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="profile-section">
            <div className="section-header">
              <h2>Account Information</h2>
              {!editing && (
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setEditing(true)}
                >
                  Edit Profile
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91 1234567890"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">Address</label>
                  <textarea
                    id="address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    rows="3"
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-info">
                <div className="info-row">
                  <span className="info-label">Name</span>
                  <span className="info-value">{user?.name || "Not set"}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Email</span>
                  <span className="info-value">{user?.email}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Phone</span>
                  <span className="info-value">{form.phone || "Not set"}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Address</span>
                  <span className="info-value">
                    {form.address || "Not set"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="profile-section">
            <h2>Quick Actions</h2>
            <div className="quick-actions">
              <a href="/orders" className="action-card">
                <span className="action-icon">📦</span>
                <h3>My Orders</h3>
                <p>View and track your orders</p>
              </a>
              <a href="/favorites" className="action-card">
                <span className="action-icon">❤️</span>
                <h3>Favorites</h3>
                <p>Manage your wishlist</p>
              </a>
              <a href="/cart" className="action-card">
                <span className="action-icon">🛒</span>
                <h3>Shopping Cart</h3>
                <p>Complete your purchase</p>
              </a>
            </div>
          </div>

          {/* Security */}
          <div className="profile-section">
            <h2>Security</h2>
            <div className="security-actions">
              <button className="btn btn-outline">Change Password</button>
              <button className="btn btn-danger" onClick={logout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
