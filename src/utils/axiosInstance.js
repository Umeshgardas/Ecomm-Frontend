import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api", // Make sure this matches your backend PORT
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;