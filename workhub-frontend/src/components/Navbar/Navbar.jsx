import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Navbar.css";

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);

    // Relê o utilizador sempre que a rota muda (ex: após login e navigate)
    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        setUser(storedUser ? JSON.parse(storedUser) : null);
    }, [location]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        navigate("/login");
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-brand">
                    <Link to="/">WorkHub Spaces</Link>
                </div>

                <div className="navbar-links">
                    <Link to="/spaces">Catálogo de Espaços</Link>
                    {user && <Link to="/reservations/my">Minhas Reservas</Link>}
                </div>

                <div className="navbar-right">
                    {user ? (
                        <>
                            <span className="user-name">Olá, {user.nome}</span>
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