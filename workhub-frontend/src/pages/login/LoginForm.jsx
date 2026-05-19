import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { message } from "antd";
import config from "../../config";
import "./LoginForm.css";

const LoginForm = () => {
    const { register, handleSubmit } = useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const onSubmit = async (data) => {
        setLoading(true);

        try {
            const response = await fetch(`${config.API_BASE}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok && result.token) {
                localStorage.setItem("token", result.token);
                localStorage.setItem("user", JSON.stringify(result.user || {}));
                
                message.success("Login efetuado com sucesso!");
                navigate("/spaces");
            } else {
                message.error(result.message || "Email ou password incorretos");
            }
        } catch (error) {
            console.error(error);
            message.error("Erro ao ligar ao servidor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">

                <div className="auth-brand">
                    <div className="auth-logo">W</div>
                    <span>WorkHub</span>
                </div>

                <div className="auth-header">
                    <h1>Bem-vindo de volta</h1>
                    <p>Entra na tua conta para continuar</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="field-group">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="email@exemplo.com"
                            {...register("email", { required: true })}
                        />
                    </div>

                    <div className="field-group">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            {...register("password", { required: true })}
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-btn"
                        disabled={loading}
                    >
                        {loading ? "A entrar..." : "Entrar"}
                    </button>
                </form>

                <p className="auth-footer">
                    Não tens conta?{" "}
                    <Link to="/register">Regista-te</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginForm;