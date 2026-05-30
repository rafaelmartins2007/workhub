import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { message } from "antd";
import config from "../../config";
import "./Navbar.css";

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        setUser(storedUser ? JSON.parse(storedUser) : null);
    }, [location]);

    const handleLogout = () => {    
        const token = localStorage.getItem("token");

        fetch(`${config.API_BASE}/auth/logout`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then(() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                setUser(null);
                message.success("Sessão terminada");
                navigate("/login");
            })
            .catch(() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                setUser(null);
                navigate("/login");
            });
    };

    const isAdmin = user?.role === "admin";

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-brand">
                    <Link to="/">WorkHub Spaces</Link>
                </div>

                <div className="navbar-links">
                    <Link to="/spaces">Catálogo de Espaços</Link>

                    {/* Links do cliente */}
                    {user && !isAdmin && (
                        <>
                            <Link to="/reservations/my">Minhas Reservas</Link>
                            <Link to="/reservations/history">Histórico</Link>
                        </>
                    )}

                    {/* Links do admin */}
                    {isAdmin && (
                        <>
                            <Link to="/admin/spaces">Espaços</Link>
                            <Link to="/admin/my-reservations">Minhas Reservas</Link>
                            <Link to="/admin/reservations">Reservas</Link>
                            <Link to="/admin/users">Utilizadores</Link>
                            <Link to="/admin/services">Serviços</Link>
                            <Link to="/admin/reports">Relatórios</Link>
                        </>
                    )}
                </div>

                <div className="navbar-right">
                    {user ? (
                        <>
                            <Link to="/profile" className="user-name">
                                Olá, {user.nome}
                            </Link>
                            <button onClick={handleLogout} className="btn-logout">
                                Sair
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="btn-login">
                            Entrar
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;