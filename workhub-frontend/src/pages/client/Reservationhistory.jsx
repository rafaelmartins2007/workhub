import { useState, useEffect } from "react";
import { Table } from "antd";
import { useNavigate } from "react-router-dom";
import qs from "query-string";
import config from "../../config";
import "./MyReservations.css";

const PAGE_SIZE = 10;

const STATUS_LABELS = {
    Pendente:   { label: "Pendente",   className: "status pendente"   },
    Confirmada: { label: "Confirmada", className: "status confirmada" },
    Cancelada:  { label: "Cancelada",  className: "status cancelada"  },
    Concluida:  { label: "Concluída",  className: "status concluida"  },
};

const TIPO_LABELS = {
    secretaria_partilhada: "Secretária Partilhada",
    sala_reuniao:          "Sala de Reunião",
    gabinete_privado:      "Gabinete Privado",
    auditorio:             "Auditório / Eventos",
};

const ReservationHistory = () => {
    const navigate = useNavigate();
    const [loading, setLoading]           = useState(true);
    const [reservations, setReservations] = useState([]);
    const [pagination, setPagination]     = useState({ current: 1, pageSize: PAGE_SIZE, total: 0 });
    const [filtroEstado, setFiltroEstado] = useState("");

    const token = localStorage.getItem("token");

    // Ontem no formato YYYY-MM-DD — dataFim=ontem para mostrar só reservas anteriores a hoje
    const ontem = new Date();
    ontem.setDate(ontem.getDate() - 1);
    const dataFim = ontem.toISOString().split("T")[0];

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
            title: "Serviços extras",
            dataIndex: "servicosExtras",
            key: "servicosExtras",
            render: (extras) =>
                extras && extras.length > 0
                    ? extras.map((e) => e.nome || e).join(", ")
                    : "—",
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

    // dataFim=ontem → só reservas anteriores a hoje
    const fetchHistory = (page, estado) => {
        setLoading(true);

        const query = qs.stringify({
            page,
            limit:  PAGE_SIZE,
            dataFim,
            status: estado || undefined,
            sort:   "data",
            order:  "desc",
        });

        fetch(`${config.API_BASE}/reservations/my?${query}`, {
            headers: {
                Accept:        "application/json",
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

    useEffect(() => { fetchHistory(1, ""); }, []);

    const handleTableChange = (pag) => fetchHistory(pag.current, filtroEstado);

    const handleFiltroEstado = (e) => {
        const val = e.target.value;
        setFiltroEstado(val);
        fetchHistory(1, val);
    };

    return (
        <div className="reservations-page">
            <div className="reservations-header">
                <div>
                    <h1>Histórico de Reservas</h1>
                    <p>Reservas anteriores a hoje</p>
                </div>
                <button className="btn-historico" onClick={() => navigate("/reservations/my")}>
                    ← Voltar às Reservas
                </button>
            </div>

            <div className="reservations-filters">
                <select value={filtroEstado} onChange={handleFiltroEstado}>
                    <option value="">Todos os estados</option>
                    <option value="Concluida">Concluída</option>
                    <option value="Cancelada">Cancelada</option>
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

export default ReservationHistory;