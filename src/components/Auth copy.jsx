import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loginUser, registerUser, googleLogin } from "../api/auth";
import { AuthContext } from "../contexts/AuthContext";
import "./Auth.css";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const Auth = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine initial mode from URL
  const [isSignUp, setIsSignUp] = useState(location.pathname === "/register");
  
  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  
  // Register form state
  const [registerForm, setRegisterForm] = useState({
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

  // Update mode based on route changes
  useEffect(() => {
    setIsSignUp(location.pathname === "/register");
    setError("");
  }, [location.pathname]);

  // Handle login form changes
  const handleLoginChange = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
    setError("");
  };

  // Handle register form changes
  const handleRegisterChange = (e) => {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
    setError("");
  };

  // Validate register form
  const validateRegisterForm = () => {
    if (!registerForm.name || !registerForm.email || !registerForm.password || !registerForm.confirmPassword) {
      setError("All fields are required");
      return false;
    }

    if (registerForm.name.length < 2) {
      setError("Name must be at least 2 characters");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(registerForm.email)) {
      setError("Please enter a valid email");
      return false;
    }

    if (registerForm.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  // Handle login submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!loginForm.email || !loginForm.password) {
      setError("All fields are required");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(loginForm.email)) {
      setError("Please enter a valid email");
      return;
    }

    setLoading(true);

    try {
      const res = await loginUser(loginForm);
      login(res.data);
      navigate(res.data.isAdmin ? "/admin" : "/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle register submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateRegisterForm()) {
      return;
    }

    setLoading(true);

    try {
      await registerUser({
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
      });
      
      setSuccess(true);
      
      setTimeout(() => {
        setSuccess(false);
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Google Login/Register
  const handleGoogleResponse = async (response) => {
    setError("");
    setLoading(true);

    try {
      const res = await googleLogin({ credential: response.credential });
      login(res.data);
      navigate(res.data.isAdmin ? "/admin" : "/");
    } catch (err) {
      setError("Google authentication failed. Please try again.");
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

        const googleBtnElement = document.getElementById(isSignUp ? "googleBtnRegister" : "googleBtnLogin");
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
  }, [isSignUp]);

  // Re-render Google button when mode changes
  useEffect(() => {
    if (window.google && window.google.accounts) {
      const googleBtnElement = document.getElementById(isSignUp ? "googleBtnRegister" : "googleBtnLogin");
      if (googleBtnElement) {
        googleBtnElement.innerHTML = "";
        window.google.accounts.id.renderButton(googleBtnElement, {
          theme: "outline",
          size: "large",
          width: "100%",
        });
      }
    }
  }, [isSignUp]);

  // Toggle between login and register
  const toggleMode = () => {
    navigate(isSignUp ? "/login" : "/register");
    setError("");
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-wrapper-single">
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
      <div className={`auth-wrapper-toggle ${isSignUp ? "sign-up-mode" : ""}`}>
        {/* Forms Container */}
        <div className="forms-container">
          <div className="signin-signup">
            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className={`sign-in-form ${!isSignUp ? "active" : ""}`}>
              <div className="auth-header">
                <h1>Welcome Back</h1>
                <p>Login to your account to continue</p>
              </div>

              {error && !isSignUp && <div className="alert alert-error">{error}</div>}

              <div className="form-group">
                <label htmlFor="login-email">Email Address</label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={loginForm.email}
                  onChange={handleLoginChange}
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={loginForm.password}
                    onChange={handleLoginChange}
                    disabled={loading}
                    autoComplete="current-password"
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
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input type="checkbox" />
                  <span>Remember me</span>
                </label>
                <a href="/forgot-password" className="forgot-link">
                  Forgot password?
                </a>
              </div>

              <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>

              <div className="auth-divider">
                <span>OR</span>
              </div>

              <div id="googleBtnLogin" className="google-btn-container"></div>
            </form>

            {/* Register Form */}
            <form onSubmit={handleRegisterSubmit} className={`sign-up-form ${isSignUp ? "active" : ""}`}>
              <div className="auth-header">
                <h1>Create Account</h1>
                <p>Join us and start shopping</p>
              </div>

              {error && isSignUp && <div className="alert alert-error">{error}</div>}

              <div className="form-group">
                <label htmlFor="register-name">Full Name</label>
                <input
                  id="register-name"
                  name="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={registerForm.name}
                  onChange={handleRegisterChange}
                  disabled={loading}
                  autoComplete="name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="register-email">Email Address</label>
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={registerForm.email}
                  onChange={handleRegisterChange}
                  disabled={loading}
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="register-password">Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="register-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={registerForm.password}
                    onChange={handleRegisterChange}
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
                <label htmlFor="register-confirm-password">Confirm Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="register-confirm-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={registerForm.confirmPassword}
                    onChange={handleRegisterChange}
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
                    <a href="/pages/terms" target="_blank" rel="noopener noreferrer">Terms & Conditions</a>
                    {" "}and{" "}
                    <a href="/pages/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                  </span>
                </label>
              </div>

              <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account"}
              </button>

              <div className="auth-divider">
                <span>OR</span>
              </div>

              <div id="googleBtnRegister" className="google-btn-container"></div>
            </form>
          </div>
        </div>

        {/* Panels Container */}
        <div className="panels-container">
          {/* Left Panel */}
          <div className="panel left-panel">
            <div className="panel-content">
              <h2>New here?</h2>
              <p>Join us today and enjoy exclusive benefits, special offers, and a seamless shopping experience!</p>
              <button className="btn btn-transparent" onClick={toggleMode}>
                Sign Up
              </button>
            </div>
            <div className="panel-features">
              <div className="feature-item-small">
                <span className="feature-icon-small">🎁</span>
                <p>Welcome Offer</p>
              </div>
              <div className="feature-item-small">
                <span className="feature-icon-small">🚚</span>
                <p>Free Shipping</p>
              </div>
              <div className="feature-item-small">
                <span className="feature-icon-small">💳</span>
                <p>Easy Returns</p>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="panel right-panel">
            <div className="panel-content">
              <h2>Already a member?</h2>
              <p>Welcome back! Login to access your account and continue your shopping journey with us.</p>
              <button className="btn btn-transparent" onClick={toggleMode}>
                Login
              </button>
            </div>
            <div className="panel-features">
              <div className="feature-item-small">
                <span className="feature-icon-small">🔒</span>
                <p>Secure Login</p>
              </div>
              <div className="feature-item-small">
                <span className="feature-icon-small">⚡</span>
                <p>Fast Checkout</p>
              </div>
              <div className="feature-item-small">
                <span className="feature-icon-small">📦</span>
                <p>Order Tracking</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;

import { useState } from "react";
import "./Auth.css";

export default function Auth() {
  const [isSignup, setIsSignup] = useState(false);

  return (
    <div className={`container ${isSignup ? "right-panel-active" : ""}`}>
      
      {/* Sign Up */}
      <div className="form-container sign-up-container">
        <form>
          <h1>Create Account</h1>
          <input type="text" placeholder="Name" />
          <input type="email" placeholder="Email" />
          <input type="password" placeholder="Password" />
          <button>Sign Up</button>
        </form>
      </div>

      {/* Login */}
      <div className="form-container sign-in-container">
        <form>
          <h1>Sign in</h1>
          <input type="email" placeholder="Email" />
          <input type="password" placeholder="Password" />
          <button>Login</button>
        </form>
      </div>

      {/* Overlay */}
      <div className="overlay-container">
        <div className="overlay">
          <div className="overlay-panel overlay-left">
            <h1>Welcome Back!</h1>
            <p>Already have an account?</p>
            <button className="ghost" onClick={() => setIsSignup(false)}>
              Login
            </button>
          </div>

          <div className="overlay-panel overlay-right">
            <h1>Hello, Friend!</h1>
            <p>Don’t have an account?</p>
            <button className="ghost" onClick={() => setIsSignup(true)}>
              Sign Up
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
