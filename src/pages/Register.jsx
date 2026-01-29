import { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser, googleLogin } from "../api/auth";
import { AuthContext } from "../contexts/AuthContext";
import "./Auth.css";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const Register = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const googleInitialized = useRef(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const validateForm = () => {
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError("All fields are required");
      return false;
    }

    if (form.name.length < 2) {
      setError("Name must be at least 2 characters");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email");
      return false;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      await registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      
      setSuccess(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Google Login/Register
  const handleGoogleResponse = async (response) => {
    setError("");
    setLoading(true);

    try {
      const res = await googleLogin({
        credential: response.credential,
      });

      // Login the user with the response data
      login(res.data);
      
      // Redirect based on user role
      navigate(res.data.isAdmin ? "/admin" : "/");
    } catch (err) {
      setError("Google registration failed. Please try again.");
      console.error("Google registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Google Button Init
  useEffect(() => {
    if (googleInitialized.current) return;

    const interval = setInterval(() => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: handleGoogleResponse,
        });

        const googleBtnElement = document.getElementById("googleBtn");
        if (googleBtnElement) {
          window.google.accounts.id.renderButton(googleBtnElement, {
            theme: "outline",
            size: "large",
            width: "100%",
          });
        }

        googleInitialized.current = true;
        clearInterval(interval);
      }
    }, 300);

    return () => clearInterval(interval);
  }, []);

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-wrapper">
          <div className="auth-card">
            <div className="success-message">
              <div className="success-icon">✓</div>
              <h2>Registration Successful!</h2>
              <p>Your account has been created successfully.</p>
              <p className="redirect-text">Redirecting to login...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Create Account</h1>
            <p>Join us and start shopping</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={submit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={form.name}
                onChange={handleChange}
                disabled={loading}
                autoComplete="name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={form.email}
                onChange={handleChange}
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={form.password}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
              <small className="form-hint">Must be at least 6 characters</small>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="password-input-wrapper">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input type="checkbox" required />
                <span>
                  I agree to the{" "}
                  <Link to="/pages/terms" target="_blank">Terms & Conditions</Link>
                  {" "}and{" "}
                  <Link to="/pages/privacy" target="_blank">Privacy Policy</Link>
                </span>
              </label>
            </div>

            <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="auth-divider">
            <span>OR</span>
          </div>

          <div id="googleBtn" className="google-btn-container"></div>

          <div className="auth-footer">
            <p>
              Already have an account?{" "}
              <Link to="/login" className="auth-link">
                Login
              </Link>
            </p>
          </div>
        </div>

        <div className="auth-features">
          <div className="feature-item">
            <span className="feature-icon">🎁</span>
            <h3>Welcome Offer</h3>
            <p>Get 10% off on your first purchase</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🚚</span>
            <h3>Free Shipping</h3>
            <p>Free shipping on orders over ₹999</p>
          </div>
          <div className="feature-item">
            <span className="feature-icon">💳</span>
            <h3>Easy Returns</h3>
            <p>30-day hassle-free return policy</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;