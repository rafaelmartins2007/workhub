import { useState, useEffect } from "react";
import config from "../../config";
import "./MyReservations.css";

const MyReservations = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReservations();
    }, []);

    const fetchReservations = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${config.API_BASE}/reservations/my`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            const data = await res.json();
            setReservations(Array.isArray(data) ? data : Array.isArray(data.reservations) ? data.reservations : []);
        } catch (error) {
            console.error("Erro ao carregar reservas:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reservations-page">
            <div className="reservations-header">
                <h1>Minhas Reservas</h1>
                <p>Consulta o histórico das tuas reservas</p>
            </div>

            {loading ? (
                <p className="reservations-loading">A carregar reservas...</p>
            ) : reservations.length === 0 ? (
                <p className="reservations-empty">Ainda não tens nenhuma reserva.</p>
            ) : (
                <div className="reservations-list">
                    {reservations.map((res) => (
                        <div key={res._id} className="reservation-card">
                            <div className="reservation-info">
                                <h3>{res.space?.tipo?.replace(/_/g, " ") || "Espaço"}</h3>
                                <p><strong>Data:</strong> {new Date(res.data || res.dataInicio).toLocaleDateString("pt-PT")}</p>
                                <p><strong>Hora:</strong> {res.horaInicio} — duração: {res.duracao}h</p>
                                <p>
                                    <strong>Estado:</strong>
                                    <span className={`status ${res.estado?.toLowerCase()}`}>
                                        {res.estado}
                                    </span>
                                </p>
                                <p><strong>Preço total:</strong> {res.precoTotal ?? "—"}€</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyReservations;