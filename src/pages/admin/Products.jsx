import { useEffect, useContext, useState } from "react";
import { Link } from "react-router-dom";
import { getProducts, deleteProduct } from "../../api/products";
import { AuthContext } from "../../contexts/AuthContext";
import "./Products.css";

const Products = () => {
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getProducts();
      console.log("Products response:", res.data);
      setProducts(res.data.products || res.data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    if (!user || !user.token) {
      alert("You must be logged in as admin to delete products");
      return;
    }
    
    try {
      console.log("Deleting product:", id);
      await deleteProduct(id, user.token);
      setProducts(products.filter((p) => p._id !== id));
      alert("Product deleted successfully!");
    } catch (err) {
      console.error("Error deleting product:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to delete product";
      alert(errorMessage);
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading products...</div>;
  }

  if (error) {
    return (
      <div className="admin-error">
        {error}
        <button onClick={fetchProducts} style={{ marginLeft: '10px' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="admin-products">
      <div className="admin-header">
        <h2>Product Management</h2>
        <Link to="/admin/products/create" className="btn-primary">
          + Add New Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="no-products">
          <p>No products yet. Create your first product!</p>
          <Link to="/admin/products/create" className="btn-primary">
            Create Product
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
              {products.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div className="product-thumbnail">
                      {p.image ? (
                        <img src={p.image} alt={p.name} />
                      ) : (
                        <div className="no-image">No Image</div>
                      )}
                    </div>
                  </td>
                  <td className="product-name">{p.name}</td>
                  <td>{p.category || 'N/A'}</td>
                  <td>₹{Number(p.price).toLocaleString('en-IN')}</td>
                  <td>
                    <span className={`status ${p.soldOut ? 'sold-out' : 'available'}`}>
                      {p.soldOut ? 'Sold Out' : 'Available'}
                    </span>
                  </td>
                  <td className="actions">
                    <Link 
                      to={`/admin/products/edit/${p._id}`} 
                      className="btn-edit"
                    >
                      Edit
                    </Link>
                    <button 
                      onClick={() => remove(p._id)} 
                      className="btn-delete"
                    >
                      Delete
                    </button>
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

export default Products;