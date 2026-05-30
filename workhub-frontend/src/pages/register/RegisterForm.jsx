import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { message } from "antd";
import config from "../../config";
import "./RegisterForm.css";

const RegisterForm = () => {
    // Configuração do formulário e estados para carregamento e visibilidade da password
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    // Função chamada ao submeter o formulário para criar uma nova conta
    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const response = await fetch(`${config.API_BASE}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                message.success("Conta criada com sucesso! Agora podes fazer login.");
                navigate("/login");
            } else {
                message.error(result.message || "Erro ao criar conta");
            }
        } catch {
            message.error("Erro de ligação ao servidor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card scrollable">

                <div className="auth-brand">
                    <div className="auth-logo">W</div>
                    <span>WorkHub</span>
                </div>

                <div className="auth-header">
                    <h1>Criar conta</h1>
                    <p>Preenche os teus dados para começar</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>

                    {/* ── Dados pessoais ── */}
                    <p className="auth-section-label">Dados pessoais</p>

                    <div className="field-group">
                        <label htmlFor="nome">Nome completo</label>
                        <input
                            id="nome"
                            placeholder="João Silva"
                            className={errors.nome ? "field-error" : ""}
                            {...register("nome", { required: "Nome é obrigatório" })}
                        />
                        {errors.nome && <span className="error-msg">{errors.nome.message}</span>}
                    </div>

                    <div className="field-row">
                        <div className="field-group">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="email@exemplo.com"
                                className={errors.email ? "field-error" : ""}
                                {...register("email", {
                                    required: "Email é obrigatório",
                                    pattern: { value: /^\S+@\S+\.\S+$/, message: "Email inválido" }
                                })}
                            />
                            {errors.email && <span className="error-msg">{errors.email.message}</span>}
                        </div>

                        <div className="field-group">
                            <label htmlFor="contacto">Contacto</label>
                            <input
                                id="contacto"
                                placeholder="912 345 678"
                                className={errors.contacto ? "field-error" : ""}
                                {...register("contacto", { required: "Contacto é obrigatório" })}
                            />
                            {errors.contacto && <span className="error-msg">{errors.contacto.message}</span>}
                        </div>
                    </div>

                    <div className="field-row">
                        <div className="field-group">
                            <label htmlFor="nif">NIF</label>
                            <input
                                id="nif"
                                placeholder="123456789"
                                className={errors.nif ? "field-error" : ""}
                                {...register("nif", { required: "NIF é obrigatório" })}
                            />
                            {errors.nif && <span className="error-msg">{errors.nif.message}</span>}
                        </div>

                        <div className="field-group">
                            <label htmlFor="morada">Morada</label>
                            <input
                                id="morada"
                                placeholder="Rua Exemplo, 123"
                                className={errors.morada ? "field-error" : ""}
                                {...register("morada", { required: "Morada é obrigatória" })}
                            />
                            {errors.morada && <span className="error-msg">{errors.morada.message}</span>}
                        </div>
                    </div>

                    {/* ── Informação profissional ── */}
                    <p className="auth-section-label">Informação profissional</p>

                    <div className="field-row">
                        <div className="field-group">
                            <label htmlFor="atividade">
                                Atividade
                                <span className="optional-tag">opcional</span>
                            </label>
                            <input
                                id="atividade"
                                placeholder="Freelancer, Designer…"
                                {...register("atividade")}
                            />
                        </div>

                        <div className="field-group">
                            <label htmlFor="empresa">
                                Empresa
                                <span className="optional-tag">opcional</span>
                            </label>
                            <input
                                id="empresa"
                                placeholder="Nome da empresa"
                                {...register("empresa")}
                            />
                        </div>
                    </div>

                    {/* ── Segurança ── */}
                    <p className="auth-section-label">Segurança</p>

                    <div className="field-group password-group">
                        <label htmlFor="password">Password</label>
                        <div className="password-wrap">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                className={errors.password ? "field-error" : ""}
                                {...register("password", {
                                    required: "Password é obrigatória",
                                    minLength: { value: 6, message: "Mínimo 6 caracteres" }
                                })}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(v => !v)}
                                aria-label={showPassword ? "Esconder password" : "Mostrar password"}
                            >
                                {/* Alterna o texto do botão consoante o estado */}
                                {showPassword ? "Ocultar" : "Mostrar"}
                            </button>
                        </div>
                        {errors.password && <span className="error-msg">{errors.password.message}</span>}
                    </div>

                    <button
                        type="submit"
                        className={`auth-btn${loading ? " loading" : ""}`}
                        disabled={loading}
                    >
                        {loading ? <span className="spinner" /> : "Criar conta"}
                    </button>
                </form>

                <p className="auth-footer">
                    Já tens conta?{" "}
                    <Link to="/login">Fazer login</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterForm;