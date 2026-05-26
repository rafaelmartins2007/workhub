import "./Spaces.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Table } from "antd";
import qs from "query-string";
import config from "../../config";

const PAGE_SIZE = 9;

const TIPO_LABELS = {
    secretaria_partilhada: "Secretária Partilhada",
    sala_reuniao:          "Sala de Reunião",
    gabinete_privado:      "Gabinete Privado",
    auditorio:             "Auditório / Eventos",
};

const Spaces = () => {
    const navigate = useNavigate();

    const [loading, setLoading]       = useState(true);
    const [spaces, setSpaces]         = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: PAGE_SIZE, total: 0 });
    const [search, setSearch]         = useState("");
    const [tipo, setTipo]             = useState("");
    const [sortBy, setSortBy]         = useState("");
    const [order, setOrder]           = useState("asc");
    const filtersRef = useRef({ search: "", tipo: "", sortBy: "", order: "asc" });

    const columns = [
        {
            title: "Tipo",
            dataIndex: "tipo",
            key: "tipo",
            render: (v) => TIPO_LABELS[v] || v,
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
            render: (v) => v ? `${v} pessoas` : "—",
        },
        {
            title: "",
            key: "detalhes",
            render: (_, record) => (
                <button
                    className="btn-details"
                    onClick={() => navigate(`/spaces/${record._id}`)}
                >
                    Ver Detalhes
                </button>
            ),
        },
    ];

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

    useEffect(() => {
        fetchSpaces(1, filtersRef.current);
    }, []);

    const handleTableChange = (pag) => {
        fetchSpaces(pag.current, filtersRef.current);
    };

    // onChange a cada tecla — igual ao padrão das aulas
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

    return (
        <div className="spaces-page">
            <div className="spaces-header">
                <h1>Catálogo de Espaços</h1>
                <p>Encontra o espaço perfeito para trabalhar</p>
            </div>

            <div className="spaces-filters">
                <input
                    type="text"
                    placeholder="Pesquisar por tipo ou descrição..."
                    value={search}
                    onChange={handleSearch}
                />

                <select value={tipo} onChange={handleTipo}>
                    <option value="">Todos os tipos</option>
                    <option value="secretaria_partilhada">Secretária Partilhada</option>
                    <option value="sala_reuniao">Sala de Reunião</option>
                    <option value="gabinete_privado">Gabinete Privado</option>
                    <option value="auditorio">Auditório / Eventos</option>
                </select>

                <select value={sortBy} onChange={handleSortBy}>
                    <option value="">Ordenar por...</option>
                    <option value="precoHora">Preço</option>
                    <option value="capacidade">Capacidade</option>
                    <option value="createdAt">Data de criação</option>
                </select>

                <select value={order} onChange={handleOrder}>
                    <option value="asc">Crescente</option>
                    <option value="desc">Decrescente</option>
                </select>
            </div>

            <Table
                columns={columns}
                rowKey={(record) => record._id}
                dataSource={spaces}
                pagination={pagination}
                loading={loading}
                onChange={handleTableChange}
            />
        </div>
    );
};

export default Spaces;