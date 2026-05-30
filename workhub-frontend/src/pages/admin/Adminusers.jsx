import { useState, useEffect } from "react";
import { Table } from "antd";
import { message } from "antd";
import config from "../../config";
import "./admin.css";

const AdminUsers = () => {
    // Estados para a lista de utilizadores, carregamento e termo de pesquisa
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const token = localStorage.getItem("token");

    // Definição das colunas da tabela de gestão de utilizadores
    const columns = [
        {
            title: "Nome",
            dataIndex: "nome",
            key: "nome",
        },
        {
            title: "Email",
            dataIndex: "email",
            key: "email",
        },
        {
            title: "NIF",
            dataIndex: "nif",
            key: "nif",
        },
        {
            title: "Contacto",
            dataIndex: "contacto",
            key: "contacto",
        },
        {
            title: "Função",
            dataIndex: "role",
            key: "role",
            render: (r) => r === "admin" ? "Administrador" : "Cliente",
        },
        {
            title: "Estado",
            dataIndex: "ativo",
            key: "ativo",
            render: (ativo) => (
                <span className={`badge ${ativo ? "badge-ativo" : "badge-inativo"}`}>
                    {ativo ? "Ativo" : "Suspenso"}
                </span>
            ),
        },
        {
            title: "Ações",
            key: "acoes",
            render: (_, record) => (
                <button
                    className={`btn-action ${record.ativo ? "danger" : ""}`}
                    onClick={() => handleToggle(record)}
                >
                    {record.ativo ? "Suspender" : "Reativar"}
                </button>
            ),
        },
    ];

    // Procura todos os utilizadores registados na plataforma
    const fetchUsers = () => {
        setLoading(true);
        fetch(`${config.API_BASE}/users`, {
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => res.json())
            .then((data) => {
                setUsers(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    // Carrega os utilizadores ao iniciar a página
    useEffect(() => { fetchUsers(); }, []);

    // Função para suspender ou reativar uma conta de utilizador
    const handleToggle = (user) => {
        const acao = user.ativo ? "suspender" : "reativar";
        if (!window.confirm(`Tens a certeza que queres ${acao} a conta de ${user.nome}?`)) return;

        fetch(`${config.API_BASE}/users/${user._id}/toggle`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => {
                message.success(data.message || "Estado alterado!");
                fetchUsers();
            })
            .catch(() => message.error("Erro ao alterar estado da conta."));
    };

    // Filtra a lista localmente com base no que o admin digita na pesquisa
    const filtered = users.filter((u) =>
        u.nome.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="admin-page">
            <div className="admin-header">
                <div className="admin-header-left">
                    <h1>Gestão de Utilizadores</h1>
                    <p>Visualiza e gere as contas registadas</p>
                </div>
            </div>

            <div className="admin-filters">
                <input
                    type="text"
                    placeholder="Pesquisar por nome ou email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <Table
                columns={columns}
                rowKey={(r) => r._id}
                dataSource={filtered}
                loading={loading}
                pagination={{ pageSize: 10 }}
            />
        </div>
    );
};

export default AdminUsers;