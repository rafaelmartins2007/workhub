/* eslint-disable react-hooks/set-state-in-effect */
import "./Spaces.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";     // ← Adicionado
import { Table } from "antd";
import qs from "query-string";
import config from "../../config";

const PAGE_SIZE = 9;

const Spaces = () => {
    const [loading, setLoading] = useState(true);
    const [spaces, setSpaces] = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: PAGE_SIZE, total: 0 });
    const [search, setSearch] = useState("");
    const searchRef = useRef("");

    const navigate = useNavigate();     

    const columns = [
        {
            title: "Tipo",
            dataIndex: "tipo",
            key: "tipo",
        },
        {
            title: "Descrição",
            dataIndex: "descricao",
            key: "descricao",
        },
        {
            title: "Preço/hora",
            dataIndex: "precoHora",
            key: "precoHora",
            render: (value) => `${value}€`,
        },
        {
            title: "Capacidade",
            dataIndex: "capacidade",
            key: "capacidade",
            render: (value) => value ? `${value} pessoas` : "—",
        },
        {
            title: "",
            key: "detalhes",
            render: (_, record) => (
                <button 
                    className="btn-details"
                    onClick={() => navigate(`/spaces/${record._id}`)}   // ← Alterado para useNavigate
                >
                    Ver Detalhes
                </button>
            ),
        },
    ];

    const fetchSpaces = (page, searchTerm) => {
        setLoading(true);

        const query = qs.stringify({
            search: searchTerm || undefined,
            page,
            limit: PAGE_SIZE,
        });

        fetch(`${config.API_BASE}/spaces?${query}`, {
            headers: { Accept: "application/json" },
        })
            .then((res) => res.json())
            .then((response) => {
                setSpaces(response.spaces || response);
                setPagination((prev) => ({
                    ...prev,
                    current: page,
                    total: response.total || 0,
                }));
                setLoading(false);
            })
            .catch((err) => {
                console.error("Erro ao carregar espaços:", err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchSpaces(1, "");
    }, []);

    const handleTableChange = (pag) => {
        fetchSpaces(pag.current, searchRef.current);
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearch(value);
        searchRef.current = value;
        fetchSpaces(1, value);
    };

    return (
        <div className="spaces-page">
            <div className="spaces-header">
                <h1>Catálogo de Espaços</h1>
                <p>Encontra o espaço perfeito para trabalhar</p>
            </div>

            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Pesquisar por tipo ou descrição..."
                    value={search}
                    onChange={handleSearch}
                />
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