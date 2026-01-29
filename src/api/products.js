import axios from "../utils/axiosInstance";

export const getProducts = (page = 1) => {
  return axios.get(`/products?page=${page}`);
};

export const getProduct = (id) => {
  return axios.get(`/products/${id}`);
};

export const createProduct = (data, token) => {
  return axios.post("/products", data, {
    headers: { 
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
  });
};

export const updateProduct = (id, data, token) => {
  return axios.put(`/products/${id}`, data, {
    headers: { 
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
  });
};

export const deleteProduct = (id, token) => {
  return axios.delete(`/products/${id}`, {
    headers: { 
      Authorization: `Bearer ${token}` 
    },
  });
};