import { useState, useEffect, useRef } from "react";
import { Table } from "antd";
import qs from "query-string";
import config from "../../config";
import "./Admin.css";

const PAGE_SIZE = 10;

const TIPO_LABELS = {
    secretaria_partilhada: "Secretária Partilhada",
    sala_reuniao: "Sala de Reunião",
    gabinete_privado: "Gabinete Privado",
    auditorio: "Auditório / Eventos",
};

const badgeClass = {
    Pendente: "badge badge-pendente",
    Confirmada: "badge badge-confirmada",
    Cancelada: "badge badge-cancelada",
    Concluida: "badge badge-concluida",
};

const AdminReports = () => {
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({ current: 1, pageSize: PAGE_SIZE, total: 0 });
    const [period, setPeriod] = useState("6months");

    const filtersRef = useRef({ period: "6months" });

    const token = localStorage.getItem("token");

    const columns = [
        {
            title: "Cliente",
            dataIndex: "user",
            key: "user",
            render: (u) => u?.nome || "—",
        },
        {
            title: "Espaço",
            dataIndex: "space",
            key: "space",
            render: (s) => TIPO_LABELS[s?.tipo] || s?.tipo?.replace(/_/g, " ") || "—",
        },
        {
            title: "Data",
            dataIndex: "data",
            key: "data",
            render: (d) => new Date(d).toLocaleDateString("pt-PT"),
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
            title: "Estado",
            dataIndex: "estado",
            key: "estado",
            render: (e) => <span className={badgeClass[e] || "badge"}>{e}</span>,
        },
        {
            title: "Serviços Extras",
            dataIndex: "servicosExtras",
            key: "extras",
            render: (extras) =>
                extras && extras.length > 0
                    ? extras.map((s) => s.nome).join(", ")
                    : "—",
        },
    ];

    const fetchReports = (page, currentPeriod) => {
        setLoading(true);

        const params = { page, limit: PAGE_SIZE, sort: "data", order: "desc" };

        if (currentPeriod !== "all") {
            const months = currentPeriod === "1month" ? 1 : currentPeriod === "3months" ? 3 : 6;
            const dateInicio = new Date();
            dateInicio.setMonth(dateInicio.getMonth() - months);
            params.dataInicio = dateInicio.toISOString().split("T")[0];
        }

        fetch(`${config.API_BASE}/reservations?${qs.stringify(params)}`, {
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

    useEffect(() => { fetchReports(1, period); }, []);

    const handleTableChange = (pag) => {
        fetchReports(pag.current, filtersRef.current.period);
    };

    const handlePeriod = (e) => {
        const val = e.target.value;
        setPeriod(val);
        filtersRef.current = { period: val };
        fetchReports(1, val);
    };

    return (
        <div className="admin-page">
            <div className="admin-header">
                <div className="admin-header-left">
                    <h1>Relatórios</h1>
                    <p>Histórico de reservas da plataforma</p>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <span className="reports-total-label">
                        {pagination.total} reservas encontradas
                    </span>
                    <select
                        className="reports-period-select"
                        value={period}
                        onChange={handlePeriod}
                    >
                        <option value="1month">Último mês</option>
                        <option value="3months">Últimos 3 meses</option>
                        <option value="6months">Últimos 6 meses</option>
                        <option value="all">Todo o histórico</option>
                    </select>
                </div>
            </div>

            <Table
                columns={columns}
                rowKey={(r) => r._id}
                dataSource={reservations}
                pagination={pagination}
                loading={loading}
                onChange={handleTableChange}
            />
        </div>
    );
};

export default AdminReports;
