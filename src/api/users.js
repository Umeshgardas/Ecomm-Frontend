import axios from "../utils/axiosInstance";

export const getProfile = (token) =>
  axios.get("/users/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });

export const addToCart = (data, token) =>
  axios.post("/users/cart", data, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const addToFavorite = (data, token) =>
  axios.post("/users/favorite", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
