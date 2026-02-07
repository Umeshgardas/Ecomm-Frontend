import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://ecomm-backend-xydc.onrender.com/api", // Make sure this matches your backend PORT
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;