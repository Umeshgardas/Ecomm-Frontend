import { useState, useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProduct, updateProduct } from "../../api/products";
import { AuthContext } from "../../contexts/AuthContext";
import "./ProductForm.css";

const EditProduct = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    name: "",
    category: "Linen",
    price: "",
    originalPrice: "",
    image: "",
    soldOut: false,
    description: "",
  });

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const res = await getProduct(id);
      const product = res.data;
      
      if (product) {
        setForm({
          name: product.name || "",
          category: product.category || "Linen",
          price: product.price || "",
          originalPrice: product.originalPrice || "",
          image: product.image || "",
          soldOut: product.soldOut || false,
          description: product.description || "",
        });
      } else {
        setError("Product not found");
      }
    } catch (err) {
      console.error("Error fetching product:", err);
      setError("Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Validation
    if (!form.name || !form.price) {
      setError("Name and Price are required");
      setSaving(false);
      return;
    }

    if (!user || !user.token) {
      setError("You must be logged in as admin to update products");
      setSaving(false);
      return;
    }

    try {
      const productData = {
        name: form.name,
        category: form.category,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : 0,
        image: form.image || "",
        soldOut: form.soldOut,
        description: form.description || "",
      };

      console.log("Updating product:", productData);

      const response = await updateProduct(id, productData, user.token);
      
      console.log("Product updated:", response.data);
      alert("Product updated successfully!");
      navigate("/admin/products");
    } catch (err) {
      console.error("Error updating product:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to update product. Please try again.";
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="form-loading">Loading product...</div>;
  }

  if (error && !form.name) {
    return (
      <div className="form-error-container">
        <p>{error}</p>
        <button onClick={() => navigate("/admin/products")} className="btn-primary">
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="product-form-container">
      <div className="form-header">
        <h2>Edit Product</h2>
        <button 
          onClick={() => navigate("/admin/products")}
          className="btn-secondary"
        >
          Back to Products
        </button>
      </div>

      {error && <div className="form-error">{error}</div>}

      <form onSubmit={submit} className="product-form">
        <div className="form-group">
          <label htmlFor="name">Product Name *</label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="e.g., Fish Tales - Printed Linen Shirt"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            placeholder="Product description (optional)"
            value={form.description}
            onChange={handleChange}
            rows="4"
            style={{ width: '100%', padding: '12px', border: '2px solid #eaeaea', borderRadius: '4px' }}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Category *</label>
            <select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            >
              <option value="Linen">Linen</option>
              <option value="Oxford Cotton">Oxford Cotton</option>
              <option value="Embroidery Linen">Embroidery Linen</option>
              <option value="Cotton">Cotton</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="soldOut">Status</label>
            <label className="checkbox-label">
              <input
                id="soldOut"
                name="soldOut"
                type="checkbox"
                checked={form.soldOut}
                onChange={handleChange}
              />
              <span>Mark as Sold Out</span>
            </label>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price">Price (₹) *</label>
            <input
              id="price"
              name="price"
              type="number"
              placeholder="3990"
              value={form.price}
              onChange={handleChange}
              required
              min="0"
              step="1"
            />
          </div>

          <div className="form-group">
            <label htmlFor="originalPrice">Original Price (₹)</label>
            <input
              id="originalPrice"
              name="originalPrice"
              type="number"
              placeholder="4990 (optional)"
              value={form.originalPrice}
              onChange={handleChange}
              min="0"
              step="1"
            />
            <small>Leave empty if no discount</small>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="image">Image URL</label>
          <input
            id="image"
            name="image"
            type="url"
            placeholder="https://example.com/image.jpg"
            value={form.image}
            onChange={handleChange}
          />
          <small>Enter a direct link to the product image</small>
        </div>

        {form.image && (
          <div className="image-preview">
            <label>Image Preview:</label>
            <img src={form.image} alt="Preview" onError={(e) => {
              e.target.style.display = 'none';
            }} />
          </div>
        )}

        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate("/admin/products")}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn-primary"
            disabled={saving}
          >
            {saving ? "Saving..." : "Update Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;