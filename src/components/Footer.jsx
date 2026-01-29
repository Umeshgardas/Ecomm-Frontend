import { Link } from "react-router-dom";
import { useState } from "react";
import "./Footer.css";
import ThemeToggle from "./ThemeToggle";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState("");

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
      setError("Please enter your email");
      return;
    }
    
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email");
      return;
    }

    // Here you would typically send to your API
    console.log("Newsletter subscription:", email);
    
    setSubscribed(true);
    setError("");
    setEmail("");
    
    // Reset after 3 seconds
    setTimeout(() => setSubscribed(false), 3000);
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="main-footer">
      <div className="footer-container">
        {/* Footer Content Grid */}
        <div className="footer-content">
          {/* About Section */}
          <div className="footer-section">
            <h3>ELEVEN BROTHERS</h3>
            <p className="footer-description">
              Premium quality shirts crafted with care. Experience the perfect blend of 
              comfort and style with our linen and oxford cotton collections.
            </p>
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                📘
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                📷
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                🐦
              </a>
              <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" aria-label="Pinterest">
                📌
              </a>
            </div>
            
            {/* Theme Toggle in Footer */}
            <div className="footer-theme-toggle">
              <ThemeToggle showLabel={true} size="medium" />
            </div>
          </div>

          {/* Shop Section */}
          <div className="footer-section">
            <h3>Shop</h3>
            <Link to="/collections/all-shirts">All Shirts</Link>
            <Link to="/collections/linen">Linen Shirts</Link>
            <Link to="/collections/oxford-cotton">Oxford Cotton Shirts</Link>
            <Link to="/collections/new-arrivals">New Arrivals</Link>
            <Link to="/collections/sale">Sale</Link>
          </div>

          {/* Customer Service Section */}
          <div className="footer-section">
            <h3>Customer Service</h3>
            <Link to="/pages/contact">Contact Us</Link>
            <Link to="/pages/shipping">Shipping & Returns</Link>
            <Link to="/pages/size-guide">Size Guide</Link>
            <Link to="/pages/care-instructions">Care Instructions</Link>
            <Link to="/pages/faq">FAQ</Link>
          </div>

          {/* Information Section */}
          <div className="footer-section">
            <h3>Information</h3>
            <Link to="/pages/about">About Us</Link>
            <Link to="/pages/our-story">Our Story</Link>
            <Link to="/pages/sustainability">Sustainability</Link>
            <Link to="/pages/privacy">Privacy Policy</Link>
            <Link to="/pages/terms">Terms & Conditions</Link>
          </div>

          {/* Newsletter Section */}
          <div className="footer-section newsletter-section">
            <h3>Newsletter</h3>
            <p className="newsletter-description">
              Subscribe to get special offers, free giveaways, and updates.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                className={error ? "error" : ""}
              />
              <button type="submit" disabled={subscribed}>
                {subscribed ? "✓ Subscribed" : "Subscribe"}
              </button>
            </form>
            {error && <p className="newsletter-error">{error}</p>}
            {subscribed && <p className="newsletter-success">Thank you for subscribing!</p>}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="payment-methods">
          <p>We Accept:</p>
          <div className="payment-icons">
            <span>💳</span>
            <span>💰</span>
            <span>🏦</span>
            <span>📱</span>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="copyright">
              © {currentYear} Eleven Brothers. All rights reserved.
            </p>
            <div className="footer-links">
              <Link to="/pages/privacy">Privacy</Link>
              <span>•</span>
              <Link to="/pages/terms">Terms</Link>
              <span>•</span>
              <Link to="/sitemap">Sitemap</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <button
        className="back-to-top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Back to top"
      >
        ↑
      </button>
    </footer>
  );
};

export default Footer;