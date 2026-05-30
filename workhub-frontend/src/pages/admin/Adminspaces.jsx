import { useState, useEffect, useRef } from "react";
import { Table, message } from "antd";
import { useForm } from "react-hook-form";
import qs from "query-string";
import config from "../../config";
import "./Admin.css";

// Opções de tipos de espaços disponíveis para o formulário
const TIPOS = [
    { value: "secretaria_partilhada", label: "Secretária Partilhada" },
    { value: "sala_reuniao",          label: "Sala de Reunião" },
    { value: "gabinete_privado",      label: "Gabinete Privado" },
    { value: "auditorio",             label: "Auditório / Eventos" },
];

const PAGE_SIZE = 10;

const AdminSpaces = () => {
    // Estados para dados, carregamento e paginação
    const [spaces, setSpaces]         = useState([]);
    const [loading, setLoading]       = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pageSize: PAGE_SIZE, total: 0 });
    const [saving, setSaving]         = useState(false);

    // Estados dos filtros
    const [search, setSearch] = useState("");
    const [tipo, setTipo]     = useState("");
    const [sortBy, setSortBy] = useState("");
    const [order, setOrder]   = useState("asc");

    const filtersRef = useRef({ search: "", tipo: "", sortBy: "", order: "asc" });

    const [panelOpen, setPanelOpen]       = useState(false);
    const [editingSpace, setEditingSpace] = useState(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const token = localStorage.getItem("token");

    // Configuração das colunas da tabela de espaços
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
                    <button className="btn-action" onClick={() => openEdit(record)}>Editar</button>
                    <button className="btn-action" onClick={() => toggleAtivo(record)}>
                        {record.ativo ? "Desativar" : "Ativar"}
                    </button>
                    <button className="btn-action danger" onClick={() => handleDelete(record._id)}>
                        Remover
                    </button>
                </>
            ),
        },
    ];

    // Vai buscar os espaços à API com base nos filtros ativos
    const fetchSpaces = (page, filters) => {
        setLoading(true);
        const query = qs.stringify({
            page,
            limit:  PAGE_SIZE,
            search: filters.search || undefined,
            tipo:   filters.tipo   || undefined,
            sortBy: filters.sortBy || undefined,
            order:  filters.order  || undefined,
        });

        fetch(`${config.API_BASE}/spaces/admin?${query}`, {
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
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

    // Carrega a lista inicial de espaços ao abrir a página
    useEffect(() => { fetchSpaces(1, filtersRef.current); }, []);

    // Gere a mudança de página na tabela de espaços
    const handleTableChange = (pag) => {
        fetchSpaces(pag.current, filtersRef.current);
    };

    // Manipuladores de filtros: atualizam o estado e disparam nova procura
    const handleSearch = (e) => {
        const val = e.target.value;
        setSearch(val);
        const filters = { search: val, tipo, sortBy, order };
        filtersRef.current = filters;
        fetchSpaces(1, filters);
    };

    const handleTipo = (e) => {
        const val = e.target.value;
        setTipo(val);
        const filters = { search, tipo: val, sortBy, order };
        filtersRef.current = filters;
        fetchSpaces(1, filters);
    };

    const handleSortBy = (e) => {
        const val = e.target.value;
        setSortBy(val);
        const filters = { search, tipo, sortBy: val, order };
        filtersRef.current = filters;
        fetchSpaces(1, filters);
    };

    const handleOrder = (e) => {
        const val = e.target.value;
        setOrder(val);
        const filters = { search, tipo, sortBy, order: val };
        filtersRef.current = filters;
        fetchSpaces(1, filters);
    };

    // Abre o formulário para criar um novo espaço
    const openCreate = () => { setEditingSpace(null); reset({}); setPanelOpen(true); };

    // Abre o formulário para editar um espaço existente
    const openEdit = (space) => {
        setEditingSpace(space);
        reset({
            tipo:         space.tipo,
            descricao:    space.descricao,
            capacidade:   space.capacidade,
            precoHora:    space.precoHora,
            precoDia:     space.precoDia || "",
            equipamentos: space.equipamentos?.join(", ") || "",
        });
        setPanelOpen(true);
    };

    const closePanel = () => { setPanelOpen(false); setEditingSpace(null); };

    // Guarda os dados (POST para novo, PUT para edição)
    const onSubmit = (formData) => {
        setSaving(true);
        const body = {
            tipo:         formData.tipo,
            descricao:    formData.descricao,
            capacidade:   parseInt(formData.capacidade),
            precoHora:    parseFloat(formData.precoHora),
            precoDia:     formData.precoDia ? parseFloat(formData.precoDia) : undefined,
            equipamentos: formData.equipamentos
                ? formData.equipamentos.split(",").map((e) => e.trim()).filter(Boolean)
                : [],
        };

        const url    = editingSpace ? `${config.API_BASE}/spaces/${editingSpace._id}` : `${config.API_BASE}/spaces`;
        const method = editingSpace ? "PUT" : "POST";

        fetch(url, {
            method,
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(body),
        })
            .then((res) => res.json().then((data) => ({ status: res.status, data })))
            .then(({ status, data }) => {
                if (status === 200 || status === 201) {
                    message.success(editingSpace ? "Espaço atualizado!" : "Espaço criado!");
                    closePanel();
                    fetchSpaces(pagination.current, filtersRef.current);
                } else {
                    message.error(data.message || "Erro ao guardar espaço.");
                }
            })
            .catch(() => message.error("Erro de ligação ao servidor."))
            .finally(() => setSaving(false));
    };

    // Ativa ou desativa um espaço rapidamente
    const toggleAtivo = (space) => {
        fetch(`${config.API_BASE}/spaces/${space._id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ ativo: !space.ativo }),
        })
            .then(() => {
                message.success(`Espaço ${space.ativo ? "desativado" : "ativado"}!`);
                fetchSpaces(pagination.current, filtersRef.current);
            })
            .catch(() => message.error("Erro ao alterar estado."));
    };

    // Remove um espaço permanentemente
    const handleDelete = (id) => {
        if (!window.confirm("Tens a certeza que queres remover este espaço?")) return;
        fetch(`${config.API_BASE}/spaces/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(() => {
                message.success("Espaço removido!");
                fetchSpaces(pagination.current, filtersRef.current);
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

            {/* Barra de filtros e pesquisa */}
            <div className="admin-filters">
                <input
                    type="text"
                    placeholder="Pesquisar por tipo ou descrição..."
                    value={search}
                    onChange={handleSearch}
                />

                <select value={tipo} onChange={handleTipo}>
                    <option value="">Todos os tipos</option>
                    {TIPOS.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                </select>

                <select value={sortBy} onChange={handleSortBy}>
                    <option value="">Ordenar por...</option>
                    <option value="precoHora">Preço</option>
                    <option value="capacidade">Capacidade</option>
                </select>

                <select value={order} onChange={handleOrder}>
                    <option value="asc">Crescente</option>
                    <option value="desc">Decrescente</option>
                </select>
            </div>

            <Table
                columns={columns}
                rowKey={(r) => r._id}
                dataSource={spaces}
                pagination={pagination}
                loading={loading}
                onChange={handleTableChange}
            />

            {/* Painel Lateral (Formulário) */}
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
                                <select id="tipo" className={errors.tipo ? "field-error" : ""}
                                    {...register("tipo", { required: "Tipo é obrigatório" })}>
                                    <option value="">Selecionar tipo</option>
                                    {TIPOS.map((t) => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                                {errors.tipo && <span className="error-msg">{errors.tipo.message}</span>}
                            </div>

                            <div className="field-group">
                                <label htmlFor="descricao">Descrição</label>
                                <textarea id="descricao" placeholder="Descreve o espaço..."
                                    className={errors.descricao ? "field-error" : ""}
                                    {...register("descricao", { required: "Descrição é obrigatória" })} />
                                {errors.descricao && <span className="error-msg">{errors.descricao.message}</span>}
                            </div>

                            <div className="field-group">
                                <label htmlFor="equipamentos">
                                    Equipamentos <span className="optional-tag">separados por vírgula</span>
                                </label>
                                <input id="equipamentos" placeholder="Ex: Projetor, WiFi, Ar condicionado"
                                    {...register("equipamentos")} />
                            </div>

                            <p className="form-section-label">Preços e capacidade</p>

                            <div className="field-row">
                                <div className="field-group">
                                    <label htmlFor="precoHora">Preço/hora (€)</label>
                                    <input id="precoHora" type="number" min="0" step="0.01" placeholder="0.00"
                                        className={errors.precoHora ? "field-error" : ""}
                                        {...register("precoHora", { required: "Obrigatório" })} />
                                    {errors.precoHora && <span className="error-msg">{errors.precoHora.message}</span>}
                                </div>
                                <div className="field-group">
                                    <label htmlFor="precoDia">Preço/dia (€) <span className="optional-tag">opcional</span></label>
                                    <input id="precoDia" type="number" min="0" step="0.01" placeholder="0.00"
                                        {...register("precoDia")} />
                                </div>
                            </div>

                            <div className="field-group">
                                <label htmlFor="capacidade">Capacidade (pessoas)</label>
                                <input id="capacidade" type="number" min="1" placeholder="Ex: 10"
                                    className={errors.capacidade ? "field-error" : ""}
                                    {...register("capacidade", { required: "Obrigatório" })} />
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