import { Navigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

const ProtectedRoute = ({ children, role }) => {
  const { isLoggedIn, user, loading } = useAuth();

  if (loading) return <div className="loading-screen">Loading...</div>;

  if (!isLoggedIn) return <Navigate to="/login" replace />;

  if (role && user?.role !== role) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;