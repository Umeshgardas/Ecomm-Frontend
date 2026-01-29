import { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProducts, deleteProduct } from "../../api/products";
import { AuthContext } from "../../contexts/AuthContext";
import "./ProductList.css";

const ProductList = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getProducts();
      setProducts(res.data.products || res.data || []);
    } catch (err) {
      console.error("Failed to load products:", err);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await deleteProduct(id, user.token);
      alert("Product deleted successfully!");
      fetchProducts(); // Refresh list
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete product");
    }
  };

  if (loading) return <div className="loading">Loading products...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="product-list-container">
      <div className="list-header">
        <h2>Manage Products</h2>
        <Link to="/admin/products/create" className="btn-primary">
          + Add New Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <p>No products found</p>
          <Link to="/admin/products/create" className="btn-primary">
            Create your first product
          </Link>
        </div>
      ) : (
        <div className="products-table">
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td>
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="product-thumbnail"
                      />
                    ) : (
                      <div className="no-image">No image</div>
                    )}
                  </td>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>₹{product.price}</td>
                  <td>
                    <span className={`status ${product.soldOut ? 'sold-out' : 'available'}`}>
                      {product.soldOut ? "Sold Out" : "Available"}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => navigate(`/admin/products/edit/${product._id}`)}
                        className="btn-edit"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id, product.name)}
                        className="btn-delete"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductList;