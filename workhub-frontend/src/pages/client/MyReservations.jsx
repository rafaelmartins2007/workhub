import { useState, useEffect } from "react";
import { Table } from "antd";
import { useNavigate } from "react-router-dom";
import qs from "query-string";
import config from "../../config";
import "./MyReservations.css";

const PAGE_SIZE = 10;

// Configuração visual dos estados da reserva
const STATUS_LABELS = {
    Pendente: { label: "Pendente", className: "status pendente" },
    Confirmada: { label: "Confirmada", className: "status confirmada" },
    Cancelada: { label: "Cancelada", className: "status cancelada" },
    Concluida: { label: "Concluída", className: "status concluida" },
};

// Labels para os tipos de espaço
const TIPO_LABELS = {
    secretaria_partilhada: "Secretária Partilhada",
    sala_reuniao: "Sala de Reunião",
    gabinete_privado: "Gabinete Privado",
    auditorio: "Auditório / Eventos",
};

const MyReservations = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const isAdmin = user?.role === "admin";
    const [loading, setLoading] = useState(true);
    const [reservations, setReservations] = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: PAGE_SIZE, total: 0 });
    const [filtroEstado, setFiltroEstado] = useState("");

    // Data de hoje no formato YYYY-MM-DD
    const hoje = new Date().toISOString().split("T")[0];

    // Definição das colunas da tabela de reservas do cliente
    const columns = [
        {
            title: "Espaço",
            dataIndex: "space",
            key: "space",
            render: (space) => TIPO_LABELS[space?.tipo] || space?.tipo?.replace(/_/g, " ") || "—",
        },
        {
            title: "Data",
            dataIndex: "data",
            key: "data",
            render: (data) => new Date(data).toLocaleDateString("pt-PT"),
        },
        {
            title: "Hora",
            dataIndex: "horaInicio",
            key: "horaInicio",
        },
        {
            title: "Duração",
            dataIndex: "duracao",
            key: "duracao",
            render: (d) => `${d}h`,
        },
        {
            title: "Preço total",
            dataIndex: "precoTotal",
            key: "precoTotal",
            render: (v) => v != null ? `${v}€` : "—",
        },
        {
            title: "Estado",
            dataIndex: "estado",
            key: "estado",
            render: (estado) => {
                const s = STATUS_LABELS[estado] || { label: estado, className: "status" };
                return <span className={s.className}>{s.label}</span>;
            },
        },
    ];

    // Carrega apenas as reservas do utilizador logado que sejam de hoje em diante
    const fetchReservations = (page, estado) => {
        setLoading(true);

        const query = qs.stringify({
            page,
            limit: PAGE_SIZE,
            dataInicio: hoje,
            status: estado || undefined,
            sort: "data",
            order: "asc",
        });

        fetch(`${config.API_BASE}/reservations/my?${query}`, {
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => res.json())
            .then((response) => {
                setReservations(response.reservations || []);
                setPagination((prev) => ({
                    ...prev,
                    current: page,
                    total: response.pagination?.total || 0,
                }));
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    // Vai buscar as reservas ativas do cliente ao carregar
    useEffect(() => { fetchReservations(1, ""); }, []);

    // Lida com a paginação da tabela de reservas
    const handleTableChange = (pag) => fetchReservations(pag.current, filtroEstado);

    // Filtra por estado (ex: apenas confirmadas)
    const handleFiltroEstado = (e) => {
        const val = e.target.value;
        setFiltroEstado(val);
        fetchReservations(1, val);
    };

    return (
        <div className="reservations-page">
            <div className="reservations-header">
                <div>
                    <h1>Minhas Reservas</h1>
                    <p>Reservas de hoje em diante</p>
                </div>
                {/* Botão para ver reservas antigas (Histórico) */}
                <button className="btn-historico" onClick={() => navigate(isAdmin ? "/admin/history" : "/reservations/history")}>
                    Ver Histórico
                </button>
            </div>

            <div className="reservations-filters">
                <select value={filtroEstado} onChange={handleFiltroEstado}>
                    <option value="">Todos os estados</option>
                    <option value="Pendente">Pendente</option>
                    <option value="Confirmada">Confirmada</option>
                </select>
            </div>

            <Table
                columns={columns}
                rowKey={(record) => record._id}
                dataSource={reservations}
                pagination={pagination}
                loading={loading}
                onChange={handleTableChange}
            />
        </div>
    );
};

export default MyReservations;