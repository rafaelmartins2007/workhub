import { useState, useEffect } from "react";
import { message } from "antd";
import config from "../../config";
import "./Profile.css";

const Profile = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [data, setData] = useState({
        user: null,
    });

    const fetchProfile = () => {
        fetch(`${config.API_BASE}/users/me`, {
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        })
            .then((res) => res.json())
            .then((response) => {
                setData({ user: response });
                setLoading(false);
            })
            .catch((err) => {
                console.error("Erro ao carregar perfil:", err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setData((prev) => ({
            user: { ...prev.user, [e.target.name]: e.target.value },
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setSaving(true);

        const { nome, contacto, morada, atividade, empresa } = data.user;

        fetch(`${config.API_BASE}/users/me`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ nome, contacto, morada, atividade, empresa }),
        })
            .then((res) => res.json())
            .then((response) => {
                // Atualiza o utilizador no localStorage com os novos dados
                const stored = JSON.parse(localStorage.getItem("user") || "{}");
                localStorage.setItem("user", JSON.stringify({ ...stored, nome: response.user.nome }));
                message.success("Perfil atualizado com sucesso!");
                setSaving(false);
            })
            .catch((err) => {
                console.error("Erro ao guardar perfil:", err);
                message.error("Erro ao atualizar perfil");
                setSaving(false);
            });
    };

    if (loading) return <p className="loading">A carregar perfil...</p>;
    if (!data.user) return <p>Não foi possível carregar o perfil.</p>;

    const { user } = data;

    return (
        <div className="profile-page">
            <div className="profile-card">

                <div className="profile-header">
                    <h1>O meu perfil</h1>
                    <p>Edita as tuas informações pessoais</p>
                </div>

                <form className="profile-form" onSubmit={handleSubmit}>

                    <p className="profile-section-label">Dados pessoais</p>

                    <div className="field-group">
                        <label htmlFor="nome">Nome completo</label>
                        <input
                            id="nome"
                            name="nome"
                            value={user.nome || ""}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="field-row">
                        <div className="field-group">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                name="email"
                                value={user.email || ""}
                                disabled
                                className="field-disabled"
                            />
                        </div>
                        <div className="field-group">
                            <label htmlFor="contacto">Contacto</label>
                            <input
                                id="contacto"
                                name="contacto"
                                value={user.contacto || ""}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="field-row">
                        <div className="field-group">
                            <label htmlFor="nif">NIF</label>
                            <input
                                id="nif"
                                name="nif"
                                value={user.nif || ""}
                                disabled
                                className="field-disabled"
                            />
                        </div>
                        <div className="field-group">
                            <label htmlFor="morada">Morada</label>
                            <input
                                id="morada"
                                name="morada"
                                value={user.morada || ""}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <p className="profile-section-label">Informação profissional</p>

                    <div className="field-row">
                        <div className="field-group">
                            <label htmlFor="atividade">
                                Atividade
                                <span className="optional-tag">opcional</span>
                            </label>
                            <input
                                id="atividade"
                                name="atividade"
                                placeholder="Freelancer, Designer…"
                                value={user.atividade || ""}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="field-group">
                            <label htmlFor="empresa">
                                Empresa
                                <span className="optional-tag">opcional</span>
                            </label>
                            <input
                                id="empresa"
                                name="empresa"
                                placeholder="Nome da empresa"
                                value={user.empresa || ""}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={`profile-btn${saving ? " loading" : ""}`}
                        disabled={saving}
                    >
                        {saving ? <span className="spinner" /> : "Guardar alterações"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;