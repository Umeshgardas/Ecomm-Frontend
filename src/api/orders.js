// api/orders.js - Orders API Helper Functions

const API_URL = import.meta.env.VITE_API_URL || 
                (typeof window !== 'undefined' && window.location.origin.includes('localhost') 
                  ? "http://localhost:5000" 
                  : "");

/**
 * Get all orders for the authenticated user
 */
export const getOrders = async (token) => {
  try {
    const response = await fetch(`${API_URL}/api/orders`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch orders");
    }

    return await response.json();
  } catch (error) {
    console.error("Error in getOrders:", error);
    throw error;
  }
};

/**
 * Get a single order by ID
 */
export const getOrderById = async (orderId, token) => {
  try {
    const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to fetch order");
    }

    return await response.json();
  } catch (error) {
    console.error("Error in getOrderById:", error);
    throw error;
  }
};

/**
 * Create a new order
 */
export const createOrder = async (orderData, token) => {
  try {
    const response = await fetch(`${API_URL}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to create order");
    }

    return await response.json();
  } catch (error) {
    console.error("Error in createOrder:", error);
    throw error;
  }
};

/**
 * Cancel an order
 */
export const cancelOrder = async (orderId, token) => {
  try {
    const response = await fetch(`${API_URL}/api/orders/${orderId}/cancel`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to cancel order");
    }

    return await response.json();
  } catch (error) {
    console.error("Error in cancelOrder:", error);
    throw error;
  }
};

/**
 * Update order status (Admin only)
 */
export const updateOrderStatus = async (orderId, status, token) => {
  try {
    const response = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to update order status");
    }

    return await response.json();
  } catch (error) {
    console.error("Error in updateOrderStatus:", error);
    throw error;
  }
};