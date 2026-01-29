import axios from "../utils/axiosInstance";

export const loginUser = (data) => axios.post("/auth/login", data);

export const registerUser = (data) => axios.post("/auth/register", data);

export const googleLogin = (data) => axios.post("/auth/google", data);
