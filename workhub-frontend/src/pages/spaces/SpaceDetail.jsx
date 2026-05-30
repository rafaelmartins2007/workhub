import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import config from "../../config";
import "./SpaceDetail.css";

const TIPO_LABELS = {
    secretaria_partilhada: "Secretária Partilhada",
    sala_reuniao: "Sala de Reunião",
    gabinete_privado: "Gabinete Privado",
    auditorio: "Auditório / Eventos",
};

const SpaceDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [space, setSpace] = useState(null);
    const [loading, setLoading] = useState(true);

    // Vai buscar os detalhes de um espaço específico pelo ID
    const fetchSpace = (spaceId) => {
        fetch(`${config.API_BASE}/spaces/${spaceId}`, {
            headers: { Accept: "application/json" },
        })
            .then((res) => res.json())
            .then((data) => {
                setSpace(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Erro ao carregar espaço:", err);
                setLoading(false);
            });
    };

    // Recarrega os detalhes sempre que o ID na URL mudar
    useEffect(() => {
        fetchSpace(id);
    }, [id]);

    if (loading) return <p className="loading">A carregar detalhes...</p>;
    if (!space) return <p>Espaço não encontrado.</p>;

    return (
        <div className="space-detail-page">
            <div className="detail-container">
                {/* Botão simples para regressar à lista */}

                <button className="back-button" onClick={() => navigate("/spaces")}>
                    ← Voltar ao Catálogo
                </button>

                <h1>{TIPO_LABELS[space.tipo] || space.tipo}</h1>
                <p className="detail-description">{space.descricao}</p>

                {/* Grelha de informações básicas */}
                <div className="detail-info">
                    <div className="info-item">
                        <strong>Preço por hora</strong>
                        {space.precoHora}€
                    </div>
                    <div className="info-item">
                        <strong>Preço por dia</strong>
                        {space.precoDia ? `${space.precoDia}€` : "—"}
                    </div>
                    <div className="info-item">
                        <strong>Capacidade</strong>
                        {space.capacidade} pessoas
                    </div>
                </div>

                {/* Lista de equipamentos, se existirem */}
                {space.equipamentos && space.equipamentos.length > 0 && (
                    <div className="equipamentos">
                        <h3>Equipamentos incluídos</h3>
                        <ul>
                            {space.equipamentos.map((eq, index) => (
                                <li key={index}>{eq}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Botão para avançar para o formulário de reserva */}
                <button className="btn-reservar" onClick={() => navigate(`/spaces/${id}/reserve`)}>
                    Fazer Reserva
                </button>

            </div>
        </div>
    );
};

export default SpaceDetail;