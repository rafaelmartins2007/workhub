import { useState, useEffect } from "react";
import { Table } from "antd";
import { message } from "antd";
import { useForm } from "react-hook-form";
import qs from "query-string";
import config from "../../config";
import "./admin.css";

const TIPOS = [
    { value: "secretaria_partilhada", label: "Secretária Partilhada" },
    { value: "sala_reuniao",          label: "Sala de Reunião" },
    { value: "gabinete_privado",      label: "Gabinete Privado" },
    { value: "auditorio",             label: "Auditório / Eventos" },
];

const PAGE_SIZE = 10;

const AdminSpaces = () => {
    const [spaces, setSpaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pageSize: PAGE_SIZE, total: 0 });
    const [search, setSearch] = useState("");
    const [saving, setSaving] = useState(false);

    // Painel lateral de criação/edição
    const [panelOpen, setPanelOpen] = useState(false);
    const [editingSpace, setEditingSpace] = useState(null); // null = criar, objeto = editar

    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const token = localStorage.getItem("token");

    // ── Colunas da tabela ──
    const columns = [
        {
            title: "Tipo",
            dataIndex: "tipo",
            key: "tipo",
            render: (v) => TIPOS.find((t) => t.value === v)?.label || v,
        },
        {
            title: "Descrição",
            dataIndex: "descricao",
            key: "descricao",
            ellipsis: true,
        },
        {
            title: "Preço/hora",
            dataIndex: "precoHora",
            key: "precoHora",
            render: (v) => `${v}€`,
        },
        {
            title: "Capacidade",
            dataIndex: "capacidade",
            key: "capacidade",
            render: (v) => `${v} pessoas`,
        },
        {
            title: "Estado",
            dataIndex: "ativo",
            key: "ativo",
            render: (ativo) => (
                <span className={`badge ${ativo ? "badge-ativo" : "badge-inativo"}`}>
                    {ativo ? "Ativo" : "Inativo"}
                </span>
            ),
        },
        {
            title: "Ações",
            key: "acoes",
            render: (_, record) => (
                <>
                    <button className="btn-action" onClick={() => openEdit(record)}>
                        Editar
                    </button>
                    <button
                        className="btn-action"
                        onClick={() => toggleAtivo(record)}
                    >
                        {record.ativo ? "Desativar" : "Ativar"} 
                    </button>
                    <button
                        className="btn-action danger"
                        onClick={() => handleDelete(record._id)}
                    >
                        Remover
                    </button>
                </>
            ),
        },
    ];

    // ── Fetch espaços (admin vê todos, incluindo inativos) ──
    const fetchSpaces = (page, searchTerm) => {
        setLoading(true);
        const query = qs.stringify({ page, limit: PAGE_SIZE, search: searchTerm || undefined });

        fetch(`${config.API_BASE}/spaces?${query}`, {
            headers: { Accept: "application/json" },
        })
            .then((res) => res.json())
            .then((response) => {
                setSpaces(response.spaces || []);
                setPagination((prev) => ({
                    ...prev,
                    current: page,
                    total: response.pagination?.total || 0,
                }));
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => { fetchSpaces(1, ""); }, []);

    const handleTableChange = (pag) => fetchSpaces(pag.current, search);
    const handleSearch = (e) => {
        setSearch(e.target.value);
        fetchSpaces(1, e.target.value);
    };

    // ── Abrir painel ──
    const openCreate = () => {
        setEditingSpace(null);
        reset({});
        setPanelOpen(true);
    };

    const openEdit = (space) => {
        setEditingSpace(space);
        reset({
            tipo:        space.tipo,
            descricao:   space.descricao,
            capacidade:  space.capacidade,
            precoHora:   space.precoHora,
            precoDia:    space.precoDia || "",
            equipamentos: space.equipamentos?.join(", ") || "",
        });
        setPanelOpen(true);
    };

    const closePanel = () => { setPanelOpen(false); setEditingSpace(null); };

    // ── Submeter formulário (criar ou editar) ──
    const onSubmit = (formData) => {
        setSaving(true);

        const body = {
            tipo:        formData.tipo,
            descricao:   formData.descricao,
            capacidade:  parseInt(formData.capacidade),
            precoHora:   parseFloat(formData.precoHora),
            precoDia:    formData.precoDia ? parseFloat(formData.precoDia) : undefined,
            // equipamentos: campo de texto separado por vírgulas → array
            equipamentos: formData.equipamentos
                ? formData.equipamentos.split(",").map((e) => e.trim()).filter(Boolean)
                : [],
        };

        const url    = editingSpace
            ? `${config.API_BASE}/spaces/${editingSpace._id}`
            : `${config.API_BASE}/spaces`;
        const method = editingSpace ? "PUT" : "POST";

        fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        })
            .then((res) => res.json().then((data) => ({ status: res.status, data })))
            .then(({ status, data }) => {
                if (status === 200 || status === 201) {
                    message.success(editingSpace ? "Espaço atualizado!" : "Espaço criado!");
                    closePanel();
                    fetchSpaces(pagination.current, search);
                } else {
                    message.error(data.message || "Erro ao guardar espaço.");
                }
            })
            .catch(() => message.error("Erro de ligação ao servidor."))
            .finally(() => setSaving(false));
    };

    // ── Ativar / Desativar ──
    const toggleAtivo = (space) => {
        fetch(`${config.API_BASE}/spaces/${space._id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ ativo: !space.ativo }),
        })
            .then(() => {
                message.success(`Espaço ${space.ativo ? "desativado" : "ativado"}!`);
                fetchSpaces(pagination.current, search);
            })
            .catch(() => message.error("Erro ao alterar estado."));
    };

    // ── Remover ──
    const handleDelete = (id) => {
        if (!window.confirm("Tens a certeza que queres remover este espaço?")) return;

        fetch(`${config.API_BASE}/spaces/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(() => {
                message.success("Espaço removido!");
                fetchSpaces(pagination.current, search);
            })
            .catch(() => message.error("Erro ao remover espaço."));
    };

    return (
        <div className="admin-page">
            <div className="admin-header">
                <div className="admin-header-left">
                    <h1>Gestão de Espaços</h1>
                    <p>Cria, edita e gere os espaços disponíveis</p>
                </div>
                <button className="btn-primary" onClick={openCreate}>+ Novo Espaço</button>
            </div>

            <div className="admin-filters">
                <input
                    type="text"
                    placeholder="Pesquisar por tipo..."
                    value={search}
                    onChange={handleSearch}
                />
            </div>

            <Table
                columns={columns}
                rowKey={(r) => r._id}
                dataSource={spaces}
                pagination={pagination}
                loading={loading}
                onChange={handleTableChange}
            />

            {/* ── Painel lateral de criação/edição ── */}
            {panelOpen && (
                <div className="admin-form-overlay" onClick={(e) => e.target === e.currentTarget && closePanel()}>
                    <div className="admin-form-panel">

                        <div className="admin-form-header">
                            <h2>{editingSpace ? "Editar Espaço" : "Novo Espaço"}</h2>
                            <button className="panel-close" onClick={closePanel}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} noValidate>

                            <p className="form-section-label">Informação</p>

                            <div className="field-group">
                                <label htmlFor="tipo">Tipo de espaço</label>
                                <select
                                    id="tipo"
                                    className={errors.tipo ? "field-error" : ""}
                                    {...register("tipo", { required: "Tipo é obrigatório" })}
                                >
                                    <option value="">Selecionar tipo</option>
                                    {TIPOS.map((t) => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                                {errors.tipo && <span className="error-msg">{errors.tipo.message}</span>}
                            </div>

                            <div className="field-group">
                                <label htmlFor="descricao">Descrição</label>
                                <textarea
                                    id="descricao"
                                    placeholder="Descreve o espaço..."
                                    className={errors.descricao ? "field-error" : ""}
                                    {...register("descricao", { required: "Descrição é obrigatória" })}
                                />
                                {errors.descricao && <span className="error-msg">{errors.descricao.message}</span>}
                            </div>

                            <div className="field-group">
                                <label htmlFor="equipamentos">
                                    Equipamentos
                                    <span className="optional-tag">separados por vírgula</span>
                                </label>
                                <input
                                    id="equipamentos"
                                    placeholder="Ex: Projetor, WiFi, Ar condicionado"
                                    {...register("equipamentos")}
                                />
                            </div>

                            <p className="form-section-label">Preços e capacidade</p>

                            <div className="field-row">
                                <div className="field-group">
                                    <label htmlFor="precoHora">Preço/hora (€)</label>
                                    <input
                                        id="precoHora"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        className={errors.precoHora ? "field-error" : ""}
                                        {...register("precoHora", { required: "Obrigatório" })}
                                    />
                                    {errors.precoHora && <span className="error-msg">{errors.precoHora.message}</span>}
                                </div>

                                <div className="field-group">
                                    <label htmlFor="precoDia">
                                        Preço/dia (€)
                                        <span className="optional-tag">opcional</span>
                                    </label>
                                    <input
                                        id="precoDia"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        {...register("precoDia")}
                                    />
                                </div>
                            </div>

                            <div className="field-group">
                                <label htmlFor="capacidade">Capacidade (pessoas)</label>
                                <input
                                    id="capacidade"
                                    type="number"
                                    min="1"
                                    placeholder="Ex: 10"
                                    className={errors.capacidade ? "field-error" : ""}
                                    {...register("capacidade", { required: "Obrigatório" })}
                                />
                                {errors.capacidade && <span className="error-msg">{errors.capacidade.message}</span>}
                            </div>

                            <button type="submit" className="panel-btn" disabled={saving}>
                                {saving ? <span className="spinner" /> : (editingSpace ? "Guardar alterações" : "Criar espaço")}
                            </button>

                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSpaces;