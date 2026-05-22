import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";   // useNavigate como nas aulas
import config from "../../config";
import "./SpaceDetail.css";

const SpaceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [space, setSpace] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSpace = async () => {
            try {
                const res = await fetch(`${config.API_BASE}/spaces/${id}`);
                const data = await res.json();
                setSpace(data);
            } catch (error) {
                console.error("Erro ao carregar espaço:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSpace();
    }, [id]);

    if (loading) return <p className="loading">A carregar detalhes...</p>;
    if (!space) return <p>Espaço não encontrado.</p>;

    return (
        <div className="space-detail-page">
            <div className="detail-container">
                <button className="back-button" onClick={() => navigate("/spaces")}>
                    ← Voltar ao Catálogo
                </button>

                <h1>{space.tipo}</h1>
                <p className="detail-description">{space.descricao}</p>

                <div className="detail-info">
                    <div className="info-item">
                        <strong>Preço por hora:</strong> {space.precoHora}€
                    </div>
                    <div className="info-item">
                        <strong>Preço por dia:</strong> {space.precoDia || "—"}€
                    </div>
                    <div className="info-item">
                        <strong>Capacidade:</strong> {space.capacidade} pessoas
                    </div>
                </div>

                {space.equipamentos && space.equipamentos.length > 0 && (
                    <div className="equipamentos">
                        <h3>Equipamentos incluídos</h3>
                        <ul>
                            {space.equipamentos.map((eq, index) => (
                                <li key={index}>• {eq}</li>
                            ))}
                        </ul>
                    </div>
                )}

                <button className="btn-reservar">
                    Fazer Reserva
                </button>
            </div>
        </div>
    );
};

export default SpaceDetail;