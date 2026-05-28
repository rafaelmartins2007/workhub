import "./Spaces.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Table } from "antd";
import qs from "query-string";
import config from "../../config";
import { HeartOutlined, HeartFilled } from "@ant-design/icons";

const PAGE_SIZE = 9;

const TIPO_LABELS = {
    secretaria_partilhada: "Secretária Partilhada",
    sala_reuniao: "Sala de Reunião",
    gabinete_privado: "Gabinete Privado",
    auditorio: "Auditório / Eventos",
};

const Spaces = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [spaces, setSpaces] = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: PAGE_SIZE, total: 0 });
    const [search, setSearch] = useState("");
    const [tipo, setTipo] = useState("");
    const [sortBy, setSortBy] = useState("");
    const [order, setOrder] = useState("asc");
    const filtersRef = useRef({ search: "", tipo: "", sortBy: "", order: "asc" });
    const [favoritosIds, setFavoritosIds] = useState(new Set());
    const [soFavoritos, setSoFavoritos] = useState(false);

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
                <>
                    <button
                        className="btn-details"
                        onClick={() => navigate(`/spaces/${record._id}`)}
                    >
                        Ver Detalhes
                    </button>
                    <button
                        className={`btn-heart ${favoritosIds.has(record._id) ? "ativo" : ""}`}
                        onClick={() => toggleFavorito(record._id)}
                    >
                        {favoritosIds.has(record._id)
                            ? <HeartFilled style={{ color: "#e05a5a" }} />
                            : <HeartOutlined />
                        }
                    </button>
                </>

            ),
        },
    ];

    const fetchSpaces = (page, filters) => {
        setLoading(true);

        const query = qs.stringify({
            page,
            limit: PAGE_SIZE,
            search: filters.search || undefined,
            tipo: filters.tipo || undefined,
            sortBy: filters.sortBy || undefined,
            order: filters.order || undefined,
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

    const fetchFavoritosIds = () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        fetch(`${config.API_BASE}/users/me/favorites`, {
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => res.json())
            .then((response) => {
                const ids = new Set(response.map((f) => f._id));
                setFavoritosIds(ids);
            })
            .catch(() => { });
    };

    useEffect(() => {
        fetchSpaces(1, filtersRef.current);
        fetchFavoritosIds();
    }, []);

    const handleTableChange = (pag) => {
        fetchSpaces(pag.current, filtersRef.current);
    };

    // onChange a cada tecla — igual ao padrão das aulas
    const handleSearch = (e) => {
        if (soFavoritos) return;
        const val = e.target.value;
        setSearch(val);
        const filters = { search: val, tipo, sortBy, order };
        filtersRef.current = filters;
        fetchSpaces(1, filters);
    };

    const handleTipo = (e) => {
        if (soFavoritos) return;
        const val = e.target.value;
        setTipo(val);
        const filters = { search, tipo: val, sortBy, order };
        filtersRef.current = filters;
        fetchSpaces(1, filters);
    };

    const handleSortBy = (e) => {
        if (soFavoritos) return;
        const val = e.target.value;
        setSortBy(val);
        const filters = { search, tipo, sortBy: val, order };
        filtersRef.current = filters;
        fetchSpaces(1, filters);
    };

    const handleOrder = (e) => {
        if (soFavoritos) return;
        const val = e.target.value;
        setOrder(val);
        const filters = { search, tipo, sortBy, order: val };
        filtersRef.current = filters;
        fetchSpaces(1, filters);
    };

    const toggleFavorito = (spaceId) => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const isFavorito = favoritosIds.has(spaceId);
        fetch(`${config.API_BASE}/users/me/favorites/${spaceId}`, {
            method: "POST",
            headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then(() => {
                setFavoritosIds((prev) => {
                    const newSet = new Set(prev);
                    if (isFavorito) newSet.delete(spaceId);
                    else newSet.add(spaceId);
                    return newSet;
                });
            })
            .catch(() => { });
    };

    const fetchSoFavoritos  = () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        setLoading(true);

        fetch(`${config.API_BASE}/users/me/favorites`, {
            headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((response) => {
                setSpaces(response);
                setPagination((prev) => ({
                    ...prev,
                    current: 1,
                    total: response.length,
                }));
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    const handleToggleFavoritos = () => {
        const next = !soFavoritos;
        setSoFavoritos(next);

        if (next) {
            fetchSoFavoritos();
        } else {
            fetchSpaces(1, filtersRef.current);
        }
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
                    disabled={soFavoritos}
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

                <button
                    className={`btn-favoritos-filtro ${soFavoritos ? "ativo" : ""}`}
                    onClick={handleToggleFavoritos}
                >
                    {soFavoritos ? <HeartFilled style={{ color: "#e05a5a" }} /> : <HeartOutlined />}
                    {" "}Os meus favoritos
                </button>
            </div>

            <Table
                columns={columns}
                rowKey={(record) => record._id}
                dataSource={spaces}
                pagination={soFavoritos ? false : pagination}
                loading={loading}
                onChange={handleTableChange}
            />
        </div>
    );
};

export default Spaces;