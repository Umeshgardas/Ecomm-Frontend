import { Routes, Route, Navigate } from "react-router-dom";
import { useContext, Suspense, lazy } from "react";
import { AuthContext } from "./contexts/AuthContext";

import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import AdminRoute from "./components/AdminRoute.jsx";

// Import critical pages directly
import Home from "./pages/Home.jsx";
import Checkout from "./pages/Checkout.jsx";
import OrderSuccess from "./pages/OrderSuccess.jsx";

// Lazy load pages
const Auth = lazy(() => import("./components/Auth.jsx"));
const Cart = lazy(() => import("./pages/Cart.jsx"));
const Favorites = lazy(() => import("./pages/Favorites.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const Orders = lazy(() => import("./pages/Orders.jsx"));
const ProductDetail = lazy(() => import("./pages/ProductDetail.jsx"));
const SearchResults = lazy(() => import("./pages/SearchResults.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

// Admin pages
const Dashboard = lazy(() => import("./pages/admin/Dashboard.jsx"));
const ProductList = lazy(() => import("./pages/admin/ProductList.jsx"));
const CreateProduct = lazy(() => import("./pages/admin/CreateProduct.jsx"));
const EditProduct = lazy(() => import("./pages/admin/EditProduct.jsx"));

// Collections
const AllShirts = lazy(() => import("./pages/collections/AllShirts.jsx"));
const LinenShirts = lazy(() => import("./pages/collections/LinenShirts.jsx"));
const OxfordCottonShirts = lazy(
  () => import("./pages/collections/OxfordCottonShirts.jsx")
);
const NewArrivals = lazy(() => import("./pages/collections/NewArrivals.jsx"));
const Sale = lazy(() => import("./pages/collections/Sale.jsx"));

// Info pages
const About = lazy(() => import("./pages/info/About.jsx"));
const Contact = lazy(() => import("./pages/info/Contact.jsx"));
const Shipping = lazy(() => import("./pages/info/Shipping.jsx"));
const SizeGuide = lazy(() => import("./pages/info/SizeGuide.jsx"));
const CareInstructions = lazy(
  () => import("./pages/info/CareInstructions.jsx")
);
const FAQ = lazy(() => import("./pages/info/FAQ.jsx"));
const Privacy = lazy(() => import("./pages/info/Privacy.jsx"));
const Terms = lazy(() => import("./pages/info/Terms.jsx"));
const OurStory = lazy(() => import("./pages/info/OurStory.jsx"));
const Sustainability = lazy(
  () => import("./pages/info/Sustainability.jsx")
);

// Loading UI
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
    <div className="app-container">
      <Header />

      <main className="main-content">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Home */}
            <Route path="/" element={<Home />} />

            {/* Search */}
            <Route path="/search" element={<SearchResults />} />

            {/* Auth */}
            <Route
              path="/login"
              element={user ? <Navigate to="/" replace /> : <Auth />}
            />
            <Route
              path="/register"
              element={user ? <Navigate to="/" replace /> : <Auth />}
            />

            {/* Collections */}
            <Route path="/collections/all-shirts" element={<AllShirts />} />
            <Route path="/collections/linen" element={<LinenShirts />} />
            <Route
              path="/collections/oxford-cotton"
              element={<OxfordCottonShirts />}
            />
            <Route
              path="/collections/new-arrivals"
              element={<NewArrivals />}
            />
            <Route path="/collections/sale" element={<Sale />} />

            {/* Product */}
            <Route path="/products/:id" element={<ProductDetail />} />

            {/* Info */}
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
            <Route
              path="/pages/sustainability"
              element={<Sustainability />}
            />

            {/* Protected User Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/cart" element={<Cart />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route
                path="/order-success"
                element={<OrderSuccess />}
              />
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
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

export default App;
