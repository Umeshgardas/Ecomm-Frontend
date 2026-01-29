import { Link, useNavigate, useLocation, NavLink } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { ThemeContext } from "../contexts/ThemeContext";
import SearchBar from "./SearchBar";
import "./Header.css";
import ThemeToggle from "./ThemeToggle";

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent body scroll when mobile menu or search modal is open
  useEffect(() => {
    if (mobileMenuOpen || searchModalOpen) {
      document.body.classList.add("modal-open");
      // Save current scroll position
      const scrollY = window.scrollY;
      document.body.style.top = `-${scrollY}px`;
    } else {
      document.body.classList.remove("modal-open");
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.top = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }
  }, [mobileMenuOpen, searchModalOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchModalOpen(false);
  }, [location.pathname]);

  // Close mobile menu and search on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        if (mobileMenuOpen) {
          setMobileMenuOpen(false);
        }
        if (searchModalOpen) {
          setSearchModalOpen(false);
        }
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [mobileMenuOpen, searchModalOpen]);

  // Get cart count
  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      const count = cart.reduce((total, item) => total + (item.quantity || 1), 0);
      setCartItemCount(count);
    };

    updateCartCount();

    // Listen for storage changes (cart updates from other tabs)
    window.addEventListener("storage", updateCartCount);
    
    // Listen for custom cart update event
    window.addEventListener("cartUpdated", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMobileMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const openSearchModal = () => {
    setSearchModalOpen(true);
  };

  const closeSearchModal = () => {
    setSearchModalOpen(false);
  };

  return (
    <>
      <header className={`main-header ${scrolled ? "scrolled" : ""}`}>
        <div className="header-container">
          {/* Logo */}
          <Link to="/" className="logo" onClick={closeMobileMenu}>
            ELEVEN BROTHERS
          </Link>

          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            <Link 
              to="/" 
              className={isActive("/") ? "active" : ""}
            >
              Shop
            </Link>
            <Link 
              to="/collections/all-shirts" 
              className={isActive("/collections/all-shirts") ? "active" : ""}
            >
              All Shirts
            </Link>
            <Link 
              to="/collections/linen" 
              className={isActive("/collections/linen") ? "active" : ""}
            >
              Linen
            </Link>
            <Link 
              to="/collections/oxford-cotton" 
              className={isActive("/collections/oxford-cotton") ? "active" : ""}
            >
              Oxford Cotton
            </Link>
            {user?.isAdmin && (
              <Link 
                to="/admin" 
                className={`admin-link ${isActive("/admin") ? "active" : ""}`}
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Header Icons */}
          <div className="header-actions">
            {/* Theme Toggle - Desktop only */}
            <div className="desktop-theme-toggle">
              <ThemeToggle size="small" />
            </div>

            <button 
              className="icon-button search-button" 
              aria-label="Search"
              onClick={openSearchModal}
            >
              🔍
            </button>

            {user ? (
              <>
                <Link 
                  to="/favorites" 
                  className="icon-button" 
                  aria-label="Favorites"
                  onClick={closeMobileMenu}
                >
                  ❤️
                </Link>
                
                <Link 
                  to="/cart" 
                  className="icon-button cart-button" 
                  aria-label="Cart"
                  onClick={closeMobileMenu}
                >
                  🛒
                  {cartItemCount > 0 && (
                    <span className="cart-badge">{cartItemCount}</span>
                  )}
                </Link>

                <div className="user-menu">
                  <button className="icon-button user-button" aria-label="Account">
                    👤
                  </button>
                  <div className="dropdown-menu">
                    <Link to="/profile">Profile</Link>
                    <Link to="/orders">My Orders</Link>
                    <Link to="/favorites">Wishlist</Link>
                    {user.isAdmin && <Link to="/admin">Admin Panel</Link>}
                    <hr />
                    <button onClick={handleLogout} className="logout-btn">
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <NavLink to="/login" className="auth-button login-button">
                  Login
                </NavLink>
                <NavLink to="/register" className="auth-button register-button">
                  Sign Up
                </NavLink>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile Menu Backdrop */}
        {mobileMenuOpen && (
          <div
            className="mobile-menu-backdrop"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />
        )}

        {/* Mobile Navigation */}
        <nav 
          className={`mobile-nav ${mobileMenuOpen ? "open" : ""}`}
          role="navigation"
          aria-label="Mobile navigation"
        >
          <button
            className="mobile-nav-close"
            onClick={closeMobileMenu}
            aria-label="Close menu"
          >
            ✕
          </button>
          
          <div className="mobile-nav-content">
            {/* Mobile Search Button */}
            <button 
              className="mobile-search-button"
              onClick={() => {
                closeMobileMenu();
                openSearchModal();
              }}
            >
              🔍 Search Products
            </button>

            <Link to="/" className={isActive("/") ? "active" : ""}>
              Shop
            </Link>
            <Link 
              to="/collections/all-shirts" 
              className={isActive("/collections/all-shirts") ? "active" : ""}
            >
              All Shirts
            </Link>
            <Link 
              to="/collections/linen" 
              className={isActive("/collections/linen") ? "active" : ""}
            >
              Linen
            </Link>
            <Link 
              to="/collections/oxford-cotton" 
              className={isActive("/collections/oxford-cotton") ? "active" : ""}
            >
              Oxford Cotton
            </Link>

            <hr />

            {user ? (
              <>
                <Link to="/profile">Profile</Link>
                <Link to="/cart">
                  Cart {cartItemCount > 0 && `(${cartItemCount})`}
                </Link>
                <Link to="/favorites">Favorites</Link>
                <Link to="/orders">My Orders</Link>
                {user.isAdmin && <Link to="/admin">Admin Panel</Link>}
                
                <hr />
                
                <div className="mobile-theme-toggle">
                  <ThemeToggle showLabel={true} size="medium" />
                </div>
                
                <button onClick={handleLogout} className="mobile-logout-btn">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Sign Up</Link>
                
                <hr />
                
                <div className="mobile-theme-toggle">
                  <ThemeToggle showLabel={true} size="medium" />
                </div>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Search Modal */}
      {searchModalOpen && (
        <>
          <div 
            className="search-modal-backdrop"
            onClick={closeSearchModal}
            aria-label="Close search"
          />
          <div 
            className="search-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="search-modal-title"
          >
            <div className="search-modal-header">
              <h2 id="search-modal-title" className="visually-hidden">
                Search Products
              </h2>
              <button
                className="search-modal-close"
                onClick={closeSearchModal}
                aria-label="Close search"
              >
                ✕
              </button>
            </div>
            <div className="search-modal-content">
              <SearchBar onClose={closeSearchModal} />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Header;