import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { message } from "antd";
import config from "../../config";
import "./ReservationForm.css";

// Mapeamento de tipos de espaço para nomes mais amigáveis
const TIPO_LABELS = {
    secretaria_partilhada: "Secretária Partilhada",
    sala_reuniao:          "Sala de Reunião",
    gabinete_privado:      "Gabinete Privado",
    auditorio:             "Auditório / Eventos",
};

const ReservationForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    // Configuração do formulário (react-hook-form)
    const { register, handleSubmit, watch, formState: { errors } } = useForm();

    // Estados para armazenar dados do espaço, serviços extras e estados de carregamento
    const [space, setSpace] = useState(null);
    const [spaceLoading, setSpaceLoading] = useState(true);
    const [extras, setExtras] = useState([]);
    const [extrasLoading, setExtrasLoading] = useState(true);
    const [selectedExtras, setSelectedExtras] = useState([]);
    const [loading, setLoading] = useState(false);

    // Observa o campo de duração para calcular o preço total em tempo real
    const duracao = parseFloat(watch("duracao")) || 0;

    // ── Buscar dados do espaço ──
    useEffect(() => {
        fetch(`${config.API_BASE}/spaces/${id}`, {
            headers: { Accept: "application/json" },
        })
            .then((res) => res.json())
            .then((data) => {
                setSpace(data);
                setSpaceLoading(false);
            })
            .catch(() => setSpaceLoading(false));
    }, [id]);

    // Procura todos os serviços extras (café, projetor, etc) que estão disponíveis
    useEffect(() => {
        fetch(`${config.API_BASE}/extra-services`, {
            headers: { Accept: "application/json" },
        })
            .then((res) => res.json())
            .then((response) => {
                // A API devolve { services, pagination } — igual ao padrão do projeto
                const list = response.services || response;
                setExtras(list.filter((s) => s.disponivel));
                setExtrasLoading(false);
            })
            .catch(() => setExtrasLoading(false));
    }, []);

    // Adiciona ou remove um serviço extra da seleção do utilizador
    const toggleExtra = (extraId) => {
        setSelectedExtras((prev) =>
            prev.includes(extraId)
                ? prev.filter((e) => e !== extraId)
                : [...prev, extraId]
        );
    };

    // Cálculos matemáticos para o resumo de custos
    const custoEspaco = space ? space.precoHora * duracao : 0;
    const custoExtras = selectedExtras.reduce((acc, extraId) => {
        const extra = extras.find((e) => e._id === extraId);
        return acc + (extra ? extra.preco : 0);
    }, 0);
    const custoTotal = custoEspaco + custoExtras;

    // Função chamada ao clicar em "Confirmar Reserva"
    const onSubmit = (formData) => {
        const token = localStorage.getItem("token");
        if (!token) {
            message.warning("Tens de fazer login para fazer uma reserva.");
            navigate("/login");
            return;
        }

        setLoading(true);

        const reservationData = {
            space: id,
            data: formData.data,
            horaInicio: formData.horaInicio,
            duracao: parseFloat(formData.duracao),
            observacoes: formData.observacoes || "",
            servicosExtras: selectedExtras,
        };

        fetch(`${config.API_BASE}/reservations`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(reservationData),
        })
            .then((res) => res.json().then((data) => ({ status: res.status, data })))
            .then(({ status, data }) => {
                if (status === 201) {
                    message.success("Reserva criada com sucesso!");
                    navigate("/reservations/my");
                } else if (status === 409) {
                    message.error(data.message || "Espaço já reservado nesse horário.");
                } else if (status === 403) {
                    message.error(data.message || "Conta suspensa. Não é possível fazer reservas.");
                } else {
                    message.error(data.message || "Erro ao criar reserva.");
                }
            })
            .catch(() => {
                message.error("Erro de ligação ao servidor.");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    // Define a data mínima como "hoje" para o calendário
    const today = new Date().toISOString().split("T")[0];

    if (spaceLoading) return <p className="loading">A carregar espaço...</p>;
    if (!space)       return <p>Espaço não encontrado.</p>;

    return (
        <div className="reservation-page">
            <div className="reservation-card">

                {/* Botão para voltar à página de detalhes */}
                <button className="back-button" onClick={() => navigate(`/spaces/${id}`)}>
                    ← Voltar ao espaço
                </button>

                <div className="reservation-header">
                    <h1>Fazer Reserva</h1>
                    <p>{TIPO_LABELS[space.tipo] || space.tipo} · {space.precoHora}€/hora</p>
                </div>

                <form className="reservation-form" onSubmit={handleSubmit(onSubmit)} noValidate>

                    {/* ── Data e horário ── */}
                    <p className="reservation-section-label">Data e horário</p>

                    <div className="field-row">
                        <div className="field-group">
                            <label htmlFor="data">Data</label>
                            <input
                                id="data"
                                type="date"
                                min={today}
                                className={errors.data ? "field-error" : ""}
                                {...register("data", { required: "Data é obrigatória" })}
                            />
                            {errors.data && <span className="error-msg">{errors.data.message}</span>}
                        </div>

                        <div className="field-group">
                            <label htmlFor="horaInicio">Hora de início</label>
                            <input
                                id="horaInicio"
                                type="time"
                                className={errors.horaInicio ? "field-error" : ""}
                                {...register("horaInicio", { required: "Hora é obrigatória" })}
                            />
                            {errors.horaInicio && <span className="error-msg">{errors.horaInicio.message}</span>}
                        </div>
                    </div>

                    <div className="field-group">
                        <label htmlFor="duracao">Duração</label>
                        <select
                            id="duracao"
                            className={errors.duracao ? "field-error" : ""}
                            {...register("duracao", { required: "Duração é obrigatória" })}
                        >
                            <option value="">Seleciona a duração</option>
                            <option value="1">1 hora</option>
                            <option value="2">2 horas</option>
                            <option value="3">3 horas</option>
                            <option value="4">4 horas</option>
                            <option value="6">6 horas (meio dia)</option>
                            <option value="8">8 horas (dia completo)</option>
                        </select>
                        {errors.duracao && <span className="error-msg">{errors.duracao.message}</span>}
                    </div>

                    {/* ── Serviços extras ── */}
                    <p className="reservation-section-label">Serviços extras (opcional)</p>

                    {extrasLoading ? (
                        <p className="extras-loading">A carregar serviços...</p>
                    ) : extras.length === 0 ? (
                        <p className="extras-loading">Sem serviços disponíveis de momento.</p>
                    ) : (
                        <div className="extras-list">
                            {extras.map((extra) => (
                                <div
                                    key={extra._id}
                                    className={`extra-item${selectedExtras.includes(extra._id) ? " selected" : ""}`}
                                    onClick={() => toggleExtra(extra._id)}
                                >
                                    <div className="extra-item-info">
                                        <div className="extra-item-name">{extra.nome}</div>
                                        {extra.descricao && (
                                            <div className="extra-item-desc">{extra.descricao}</div>
                                        )}
                                    </div>
                                    <span className="extra-item-price">{extra.preco}€</span>
                                    <div className="extra-checkbox" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── Observações ── */}
                    <p className="reservation-section-label">Observações</p>

                    <div className="field-group">
                        <label htmlFor="observacoes">Notas adicionais (opcional)</label>
                        <textarea
                            id="observacoes"
                            placeholder="Ex: precisamos de cadeiras extra, acesso antecipado..."
                            {...register("observacoes")}
                        />
                    </div>

                    {/* ── Resumo do custo ── */}
                    {duracao > 0 && (
                        <div className="cost-summary">
                            <div className="cost-row">
                                <span>Espaço ({duracao}h × {space.precoHora}€)</span>
                                <span>{custoEspaco.toFixed(2)}€</span>
                            </div>
                            {selectedExtras.map((extraId) => {
                                const extra = extras.find((e) => e._id === extraId);
                                if (!extra) return null;
                                return (
                                    <div key={extraId} className="cost-row">
                                        <span>{extra.nome}</span>
                                        <span>{extra.preco}€</span>
                                    </div>
                                );
                            })}
                            <div className="cost-row total">
                                <span>Total estimado</span>
                                <span>{custoTotal.toFixed(2)}€</span>
                            </div>
                        </div>
                    )}

                    <button type="submit" className="reservation-btn" disabled={loading}>
                        {loading ? <span className="spinner" /> : "Confirmar Reserva"}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default ReservationForm;