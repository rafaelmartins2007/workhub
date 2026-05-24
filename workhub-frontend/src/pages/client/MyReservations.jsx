/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect } from "react";
import { Table } from "antd";
import qs from "query-string";
import config from "../../config";
import "./MyReservations.css";

const PAGE_SIZE = 10;

const STATUS_LABELS = {
    Pendente:  { label: "Pendente",  className: "status pendente" },
    Confirmada:{ label: "Confirmada",className: "status confirmada" },
    Cancelada: { label: "Cancelada", className: "status cancelada" },
    Concluida: { label: "Concluída", className: "status concluida" },
};

const MyReservations = () => {
    const [loading, setLoading] = useState(true);
    const [reservations, setReservations] = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: PAGE_SIZE, total: 0 });
    const [filtroEstado, setFiltroEstado] = useState("");

    const columns = [
        {
            title: "Espaço",
            dataIndex: "space",
            key: "space",
            render: (space) => space?.tipo?.replace(/_/g, " ") || "—",
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

    const fetchReservations = (page, estado) => {
        setLoading(true);

        const query = qs.stringify({
            page,
            limit: PAGE_SIZE,
            status: estado || undefined,
            sort: "data",
            order: "desc",
        });

        fetch(`${config.API_BASE}/reservations/my?${query}`, {
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
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
            .catch((err) => {
                console.error("Erro ao carregar reservas:", err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchReservations(1, "");
    }, []);

    const handleTableChange = (pag) => {
        fetchReservations(pag.current, filtroEstado);
    };

    const handleFiltroEstado = (e) => {
        const value = e.target.value;
        setFiltroEstado(value);
        fetchReservations(1, value);
    };

    return (
        <div className="reservations-page">
            <div className="reservations-header">
                <h1>Minhas Reservas</h1>
                <p>Consulta o histórico das tuas reservas</p>
            </div>

            <div className="reservations-filters">
                <select value={filtroEstado} onChange={handleFiltroEstado}>
                    <option value="">Todos os estados</option>
                    <option value="Pendente">Pendente</option>
                    <option value="Confirmada">Confirmada</option>
                    <option value="Cancelada">Cancelada</option>
                    <option value="Concluida">Concluída</option>
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