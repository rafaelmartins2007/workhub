import { Navigate } from "react-router-dom";

// requireAdmin=true → só admins passam, clientes são redirecionados para "/"
// requireAdmin=false (default) → qualquer utilizador autenticado passa
const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const token = localStorage.getItem("token");
    const user  = JSON.parse(localStorage.getItem("user") || "null");

    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    if (requireAdmin && user.role !== "admin") {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;