import { Routes, Route, Navigate } from "react-router-dom";
import { useContext, Suspense, lazy } from "react";
import { AuthContext } from "./contexts/AuthContext";
import { SearchProvider } from "./contexts/SearchContext";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";

// Import critical pages directly (not lazy loaded)
import Home from "./pages/Home.jsx";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";

// Lazy load non-critical pages
const Auth = lazy(() => import("./components/Auth.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const Register = lazy(() => import("./pages/Register.jsx"));
const Cart = lazy(() => import("./pages/Cart.jsx"));
const Favorites = lazy(() => import("./pages/Favorites.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const Dashboard = lazy(() => import("./pages/admin/Dashboard.jsx"));

// Search Results Page
const SearchResults = lazy(() => import("./pages/SearchResults.jsx"));

// Admin pages
const ProductList = lazy(() => import("./pages/admin/ProductList.jsx"));
const CreateProduct = lazy(() => import("./pages/admin/CreateProduct.jsx"));
const EditProduct = lazy(() => import("./pages/admin/EditProduct.jsx"));

// Collection pages
const AllShirts = lazy(() => import("./pages/collections/AllShirts.jsx"));
const LinenShirts = lazy(() => import("./pages/collections/LinenShirts.jsx"));
const OxfordCottonShirts = lazy(
  () => import("./pages/collections/OxfordCottonShirts.jsx"),
);
const NewArrivals = lazy(() => import("./pages/collections/NewArrivals.jsx"));
const Sale = lazy(() => import("./pages/collections/Sale.jsx"));

// Info pages
const About = lazy(() => import("./pages/info/About.jsx"));
const Contact = lazy(() => import("./pages/info/Contact.jsx"));
const Shipping = lazy(() => import("./pages/info/Shipping.jsx"));
const SizeGuide = lazy(() => import("./pages/info/SizeGuide.jsx"));
const CareInstructions = lazy(
  () => import("./pages/info/CareInstructions.jsx"),
);
const FAQ = lazy(() => import("./pages/info/FAQ.jsx"));
const Privacy = lazy(() => import("./pages/info/Privacy.jsx"));
const Terms = lazy(() => import("./pages/info/Terms.jsx"));
const OurStory = lazy(() => import("./pages/info/OurStory.jsx"));
const Sustainability = lazy(() => import("./pages/info/Sustainability.jsx"));

// User pages
const Orders = lazy(() => import("./pages/Orders.jsx"));

// Product detail page
const ProductDetail = lazy(() => import("./pages/ProductDetail.jsx"));

// 404 Not Found page
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

// Loading component with inline styles to ensure it displays properly
const LoadingSpinner = () => (
  <div
    style={{
      minHeight: "60vh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      gap: "1rem",
    }}
  >
    <div className="loading-spinner"></div>
    <p style={{ color: "#666", fontSize: "14px" }}>Loading...</p>
  </div>
);

function App() {
  const { user } = useContext(AuthContext);

  return (
    <SearchProvider>
      <div className="app-container">
        <Header />

        <main className="main-content">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Home */}
              <Route path="/" element={<Home />} />

              {/* Search Route */}
              <Route path="/search" element={<SearchResults />} />

              {/* Authentication Routes */}
              <Route
                path="/login"
                element={user ? <Navigate to="/" replace /> : <Auth />}
              />
              <Route
                path="/register"
                element={user ? <Navigate to="/" replace /> : <Auth />}
              />

              {/* Collection Routes */}
              <Route path="/collections/all-shirts" element={<AllShirts />} />
              <Route path="/collections/linen" element={<LinenShirts />} />
              <Route
                path="/collections/oxford-cotton"
                element={<OxfordCottonShirts />}
              />
              <Route path="/collections/new-arrivals" element={<NewArrivals />} />
              <Route path="/collections/sale" element={<Sale />} />

              {/* Product Detail */}
              <Route path="/products/:id" element={<ProductDetail />} />

              {/* Info Pages */}
              <Route path="/pages/about" element={<About />} />
              <Route path="/pages/contact" element={<Contact />} />
              <Route path="/pages/shipping" element={<Shipping />} />
              <Route path="/pages/size-guide" element={<SizeGuide />} />
              <Route
                path="/pages/care-instructions"
                element={<CareInstructions />}
              />
              <Route path="/pages/faq" element={<FAQ />} />
              <Route path="/pages/privacy" element={<Privacy />} />
              <Route path="/pages/terms" element={<Terms />} />
              <Route path="/pages/our-story" element={<OurStory />} />
              <Route path="/pages/sustainability" element={<Sustainability />} />

              {/* Protected User Routes */}
              <Route element={<PrivateRoute />}>
                <Route path="/cart" element={<Cart />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-success" element={<OrderSuccess />} />
              </Route>

              {/* Admin Routes */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<Dashboard />} />
                <Route path="/admin/products" element={<ProductList />} />
                <Route
                  path="/admin/products/create"
                  element={<CreateProduct />}
                />
                <Route
                  path="/admin/products/edit/:id"
                  element={<EditProduct />}
                />
                <Route path="/admin/orders" element={<Dashboard />} />
                <Route path="/admin/users" element={<Dashboard />} />
                <Route path="/admin/settings" element={<Dashboard />} />
              </Route>

              {/* 404 Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>

        <Footer />
      </div>
    </SearchProvider>
  );
}

export default App;