import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { Button, message } from "antd";
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
                localStorage.setItem("user", JSON.stringify(result.user));
                message.success("Login realizado com sucesso!");
                navigate("/");
            } else {
                message.error(result.message || "Email ou password incorretos");
            }
        } catch {
            message.error("Erro de ligação ao servidor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h1 className="login-title">WorkHub Spaces</h1>

                <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
                    <label>Email</label>
                    <input {...register("email")} type="email" placeholder="email@exemplo.com" />

                    <label>Password</label>
                    <input {...register("password")} type="password" placeholder="********" />

                    <Button
                        type="primary"
                        htmlType="submit"
                        className="login-button"
                        loading={loading}
                        size="large"
                    >
                        Entrar
                    </Button>
                </form>

                <div className="login-link">
                    Não tens conta? <Link to="/register">Regista-te</Link>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;