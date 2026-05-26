import { useState, useEffect } from "react";
import { Table } from "antd";
import { message } from "antd";
import { useForm } from "react-hook-form";
import qs from "query-string";
import config from "../../config";
import "./admin.css";

const ESTADOS = ["Pendente", "Confirmada", "Cancelada", "Concluida"];

const PAGE_SIZE = 10;

const AdminReservations = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pageSize: PAGE_SIZE, total: 0 });
    const [filtroEstado, setFiltroEstado] = useState("");
    const [saving, setSaving] = useState(false);

    // Painel lateral de edição
    const [panelOpen, setPanelOpen] = useState(false);
    const [editingRes, setEditingRes] = useState(null);

    const { register, handleSubmit, reset } = useForm();

    const token = localStorage.getItem("token");

    const badgeClass = {
        Pendente: "badge badge-pendente",
        Confirmada: "badge badge-confirmada",
        Cancelada: "badge badge-cancelada",
        Concluida: "badge badge-concluida",
    };

    const columns = [
        { title: "Cliente", dataIndex: "user", key: "user", render: (u) => u?.nome || "—" },
        { title: "Espaço", dataIndex: "space", key: "space", render: (s) => s?.tipo?.replace(/_/g, " ") || "—" },
        { title: "Data", dataIndex: "data", key: "data", render: (d) => new Date(d).toLocaleDateString("pt-PT") },
        { title: "Hora", dataIndex: "horaInicio", key: "horaInicio" },
        { title: "Duração", dataIndex: "duracao", key: "duracao", render: (d) => `${d}h` },
        { 
            title: "Estado", 
            dataIndex: "estado", 
            key: "estado", 
            render: (e) => <span className={badgeClass[e] || "badge"}>{e}</span> 
        },
        {
            title: "Ações",
            key: "acoes",
            render: (_, record) => (
                <button className="btn-action" onClick={() => openEdit(record)}>
                    Editar
                </button>
            ),
        },
    ];

    const fetchReservations = (page, estado) => {
        setLoading(true);
        const query = qs.stringify({
            page,
            limit: PAGE_SIZE,
            sort: "data",
            order: "desc",
            status: estado || undefined,
        });

        fetch(`${config.API_BASE}/reservations?${query}`, {
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
        })
            .then(res => res.json())
            .then(response => {
                setReservations(response.reservations || []);
                setPagination(prev => ({
                    ...prev,
                    current: page,
                    total: response.pagination?.total || 0,
                }));
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        fetchReservations(1, "");
    }, []);

    const handleTableChange = (pag) => fetchReservations(pag.current, filtroEstado);

    const handleFiltroEstado = (e) => {
        setFiltroEstado(e.target.value);
        fetchReservations(1, e.target.value);
    };

    const openEdit = (res) => {
        setEditingRes(res);
        reset({
            estado: res.estado,
            horaInicio: res.horaInicio,
            observacoesInternas: res.observacoesInternas || "",
        });
        setPanelOpen(true);
    };

    const closePanel = () => {
        setPanelOpen(false);
        setEditingRes(null);
    };

    const onSubmit = (formData) => {
        setSaving(true);
        fetch(`${config.API_BASE}/reservations/${editingRes._id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                estado: formData.estado,
                horaInicio: formData.horaInicio,
                observacoesInternas: formData.observacoesInternas,
            }),
        })
            .then(res => res.json().then(data => ({ status: res.status, data })))
            .then(({ status, data }) => {
                if (status === 200) {
                    message.success("Reserva atualizada com sucesso!");
                    closePanel();
                    fetchReservations(pagination.current, filtroEstado);
                } else {
                    message.error(data.message || "Erro ao atualizar reserva.");
                }
            })
            .catch(() => message.error("Erro de ligação ao servidor."))
            .finally(() => setSaving(false));
    };

    return (
        <div className="admin-page">
            <div className="admin-header">
                <div className="admin-header-left">
                    <h1>Gestão de Reservas</h1>
                    <p>Confirma, cancela e gere todas as reservas</p>
                </div>
            </div>

            <div className="admin-filters">
                <select value={filtroEstado} onChange={handleFiltroEstado}>
                    <option value="">Todos os estados</option>
                    {ESTADOS.map(e => (
                        <option key={e} value={e}>{e}</option>
                    ))}
                </select>
            </div>

            <Table
                columns={columns}
                rowKey={r => r._id}
                dataSource={reservations}
                pagination={pagination}
                loading={loading}
                onChange={handleTableChange}
            />

            {/* Painel de Edição */}
            {panelOpen && editingRes && (
                <div className="admin-form-overlay" onClick={e => e.target === e.currentTarget && closePanel()}>
                    <div className="admin-form-panel">
                        <div className="admin-form-header">
                            <h2>Editar Reserva</h2>
                            <button className="panel-close" onClick={closePanel}>✕</button>
                        </div>

                        <p className="form-section-label">Detalhes</p>
                        <div style={{ fontSize: 13, color: "#666", marginBottom: 20, lineHeight: 1.8 }}>
                            <div><strong>Cliente:</strong> {editingRes.user?.nome || "—"}</div>
                            <div><strong>Email:</strong> {editingRes.user?.email || "—"}</div>
                            <div><strong>Espaço:</strong> {editingRes.space?.tipo?.replace(/_/g, " ") || "—"}</div>
                            <div><strong>Data:</strong> {new Date(editingRes.data).toLocaleDateString("pt-PT")}</div>
                            <div><strong>Duração:</strong> {editingRes.duracao}h</div>

                            {/* SERVIÇOS EXTRAS - Versão simples e limpa */}
                            <div>
                                <strong>Serviços extras:</strong>
                                <div style={{ marginTop: "8px" }}>
                                    {editingRes.servicosExtras && editingRes.servicosExtras.length > 0 ? (
                                        editingRes.servicosExtras.map((extra) => (
                                            <div key={extra._id} style={{
                                                background: "#f8f8f8",
                                                padding: "6px 10px",
                                                margin: "4px 0",
                                                borderRadius: "6px",
                                                display: "flex",
                                                justifyContent: "space-between"
                                            }}>
                                                <span>{extra.nome}</span>
                                                <span style={{ fontWeight: "600" }}>{extra.preco}€</span>
                                            </div>
                                        ))
                                    ) : (
                                        <span style={{ color: "#888", fontStyle: "italic" }}>Nenhum serviço extra selecionado</span>
                                    )}
                                </div>
                            </div>

                            {editingRes.observacoes && (
                                <div><strong>Observações cliente:</strong> {editingRes.observacoes}</div>
                            )}
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} noValidate>
                            <p className="form-section-label">Alterar</p>

                            <div className="field-group">
                                <label htmlFor="estado">Estado da reserva</label>
                                <select id="estado" {...register("estado")}>
                                    {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                                </select>
                            </div>

                            <div className="field-group">
                                <label htmlFor="horaInicio">Hora de início</label>
                                <input id="horaInicio" type="time" {...register("horaInicio")} />
                            </div>

                            <div className="field-group">
                                <label htmlFor="observacoesInternas">
                                    Observações internas <span className="optional-tag">não visíveis ao cliente</span>
                                </label>
                                <textarea
                                    id="observacoesInternas"
                                    placeholder="Notas internas sobre esta reserva..."
                                    {...register("observacoesInternas")}
                                />
                            </div>

                            <button type="submit" className="panel-btn" disabled={saving}>
                                {saving ? <span className="spinner" /> : "Guardar alterações"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminReservations;