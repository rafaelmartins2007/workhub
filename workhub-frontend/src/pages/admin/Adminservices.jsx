import { useState, useEffect } from "react";
import { Table } from "antd";
import { message } from "antd";
import { useForm } from "react-hook-form";
import qs from "query-string";
import config from "../../config";
import "./admin.css";

const PAGE_SIZE = 10;

const AdminServices = () => {
    // Estados para dados, paginação, pesquisa e controlo do painel lateral
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pageSize: PAGE_SIZE, total: 0 });
    const [search, setSearch] = useState("");
    const [saving, setSaving] = useState(false);

    const [panelOpen, setPanelOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);

    // Configuração do formulário para criação/edição
    const { register, handleSubmit, reset, formState: { errors } } = useForm();

    const token = localStorage.getItem("token");

    // Colunas da tabela de serviços extras (Café, Projetor, etc)
    const columns = [
        {
            title: "Nome",
            dataIndex: "nome",
            key: "nome",
        },
        {
            title: "Descrição",
            dataIndex: "descricao",
            key: "descricao",
            ellipsis: true,
        },
        {
            title: "Preço",
            dataIndex: "preco",
            key: "preco",
            render: (v) => `${v}€`,
        },
        {
            title: "Disponibilidade",
            dataIndex: "disponivel",
            key: "disponivel",
            render: (d) => (
                <span className={`badge ${d ? "badge-disponivel" : "badge-indisponivel"}`}>
                    {d ? "Disponível" : "Indisponível"}
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
                        onClick={() => toggleDisponivel(record)}
                    >
                        {record.disponivel ? "Desativar" : "Ativar"}
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

    // Carrega os serviços da API com suporte a paginação e pesquisa
    const fetchServices = (page, searchTerm) => {
        setLoading(true);
        const query = qs.stringify({ page, limit: PAGE_SIZE, search: searchTerm || undefined });

        fetch(`${config.API_BASE}/extra-services?${query}`, {
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => res.json())
            .then((response) => {
                setServices(response.services || []);
                setPagination((prev) => ({
                    ...prev,
                    current: page,
                    total: response.pagination?.total || 0,
                }));
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    // Procura os serviços iniciais ao montar o componente
    useEffect(() => { fetchServices(1, ""); }, []);

    // Lida com a troca de página na listagem de serviços
    const handleTableChange = (pag) => fetchServices(pag.current, search);
    const handleSearch = (e) => {
        setSearch(e.target.value);
        fetchServices(1, e.target.value);
    };

    // Limpa o formulário e abre o painel para criar novo serviço
    const openCreate = () => {
        setEditingService(null);
        reset({});
        setPanelOpen(true);
    };

    // Preenche o formulário e abre o painel para editar serviço existente
    const openEdit = (service) => {
        setEditingService(service);
        reset({
            nome:      service.nome,
            descricao: service.descricao,
            preco:     service.preco,
        });
        setPanelOpen(true);
    };

    const closePanel = () => { setPanelOpen(false); setEditingService(null); };

    // Envia os dados para a API (POST para novo, PUT para editar)
    const onSubmit = (formData) => {
        setSaving(true);

        const body = {
            nome:      formData.nome,
            descricao: formData.descricao,
            preco:     parseFloat(formData.preco),
        };

        const url    = editingService
            ? `${config.API_BASE}/extra-services/${editingService._id}`
            : `${config.API_BASE}/extra-services`;
        const method = editingService ? "PUT" : "POST";

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
                    message.success(editingService ? "Serviço atualizado!" : "Serviço criado!");
                    closePanel();
                    fetchServices(pagination.current, search);
                } else {
                    message.error(data.message || "Erro ao guardar serviço.");
                }
            })
            .catch(() => message.error("Erro de ligação ao servidor."))
            .finally(() => setSaving(false));
    };

    // Alterna a disponibilidade do serviço (se aparece ou não para os clientes)
    const toggleDisponivel = (service) => {
        fetch(`${config.API_BASE}/extra-services/${service._id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ disponivel: !service.disponivel }),
        })
            .then(() => {
                message.success(`Serviço ${service.disponivel ? "desativado" : "ativado"}!`);
                fetchServices(pagination.current, search);
            })
            .catch(() => message.error("Erro ao alterar disponibilidade."));
    };

    // Remove permanentemente um serviço extra
    const handleDelete = (id) => {
        if (!window.confirm("Tens a certeza que queres remover este serviço?")) return;

        fetch(`${config.API_BASE}/extra-services/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(() => {
                message.success("Serviço removido!");
                fetchServices(pagination.current, search);
            })
            .catch(() => message.error("Erro ao remover serviço."));
    };

    return (
        <div className="admin-page">
            <div className="admin-header">
                <div className="admin-header-left">
                    <h1>Gestão de Serviços Extras</h1>
                    <p>Cria e gere os serviços adicionais disponíveis nas reservas</p>
                </div>
                <button className="btn-primary" onClick={openCreate}>+ Novo Serviço</button>
            </div>

            <div className="admin-filters">
                <input
                    type="text"
                    placeholder="Pesquisar por nome ou descrição..."
                    value={search}
                    onChange={handleSearch}
                />
            </div>

            <Table
                columns={columns}
                rowKey={(r) => r._id}
                dataSource={services}
                pagination={pagination}
                loading={loading}
                onChange={handleTableChange}
            />

            {/* ── Painel lateral ── */}
            {panelOpen && (
                <div className="admin-form-overlay" onClick={(e) => e.target === e.currentTarget && closePanel()}>
                    <div className="admin-form-panel">

                        <div className="admin-form-header">
                            <h2>{editingService ? "Editar Serviço" : "Novo Serviço"}</h2>
                            <button className="panel-close" onClick={closePanel}>✕</button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} noValidate>

                            <p className="form-section-label">Informação</p>

                            <div className="field-group">
                                <label htmlFor="nome">Nome</label>
                                <input
                                    id="nome"
                                    placeholder="Ex: Coffee Break"
                                    className={errors.nome ? "field-error" : ""}
                                    {...register("nome", { required: "Nome é obrigatório" })}
                                />
                                {errors.nome && <span className="error-msg">{errors.nome.message}</span>}
                            </div>

                            <div className="field-group">
                                <label htmlFor="descricao">Descrição</label>
                                <textarea
                                    id="descricao"
                                    placeholder="Descreve o serviço..."
                                    className={errors.descricao ? "field-error" : ""}
                                    {...register("descricao", { required: "Descrição é obrigatória" })}
                                />
                                {errors.descricao && <span className="error-msg">{errors.descricao.message}</span>}
                            </div>

                            <div className="field-group">
                                <label htmlFor="preco">Preço (€)</label>
                                <input
                                    id="preco"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    className={errors.preco ? "field-error" : ""}
                                    {...register("preco", { required: "Preço é obrigatório" })}
                                />
                                {errors.preco && <span className="error-msg">{errors.preco.message}</span>}
                            </div>

                            <button type="submit" className="panel-btn" disabled={saving}>
                                {saving ? <span className="spinner" /> : (editingService ? "Guardar alterações" : "Criar serviço")}
                            </button>

                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminServices;