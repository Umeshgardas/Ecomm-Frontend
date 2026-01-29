import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

const AdminRoute = () => {
  const { user } = useContext(AuthContext);
  return user?.isAdmin ? <Outlet /> : <Navigate to="/" />;
};

export default AdminRoute;
