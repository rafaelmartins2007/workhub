import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { Button, message } from "antd";
import config from "../../config";
import "./RegisterForm.css";

const RegisterForm = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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
        <div className="register-container">
            <div className="register-card">
                <h1 className="register-title">Criar Conta</h1>

                <form className="register-form" onSubmit={handleSubmit(onSubmit)}>

                    <label>Nome completo</label>
                    <input
                        {...register("nome", { required: true })}
                        placeholder="João Silva"
                    />
                    {errors.nome && <p style={{ color: "red", fontSize: "13px", marginTop: "-14px", marginBottom: "14px" }}>Nome é obrigatório</p>}

                    <label>Email</label>
                    <input
                        {...register("email", { required: true })}
                        type="email"
                        placeholder="email@exemplo.com"
                    />
                    {errors.email && <p style={{ color: "red", fontSize: "13px", marginTop: "-14px", marginBottom: "14px" }}>Email é obrigatório</p>}

                    <label>Contacto</label>
                    <input
                        {...register("contacto", { required: true })}
                        placeholder="912345678"
                    />
                    {errors.contacto && <p style={{ color: "red", fontSize: "13px", marginTop: "-14px", marginBottom: "14px" }}>Contacto é obrigatório</p>}

                    <label>Morada</label>
                    <input
                        {...register("morada", { required: true })}
                        placeholder="Rua Exemplo, 123 - Porto"
                    />
                    {errors.morada && <p style={{ color: "red", fontSize: "13px", marginTop: "-14px", marginBottom: "14px" }}>Morada é obrigatória</p>}

                    <label>NIF</label>
                    <input
                        {...register("nif", { required: true })}
                        placeholder="123456789"
                    />
                    {errors.nif && <p style={{ color: "red", fontSize: "13px", marginTop: "-14px", marginBottom: "14px" }}>NIF é obrigatório</p>}

                    <label>Atividade (opcional)</label>
                    <input
                        {...register("atividade")}
                        placeholder="Freelancer, Designer, etc."
                    />

                    <label>Empresa (opcional)</label>
                    <input
                        {...register("empresa")}
                        placeholder="Nome da empresa"
                    />

                    <label>Password</label>
                    <input
                        {...register("password", { required: true })}
                        type="password"
                        placeholder="Escolha uma password"
                    />
                    {errors.password && <p style={{ color: "red", fontSize: "13px", marginTop: "-14px", marginBottom: "14px" }}>Password é obrigatória</p>}

                    <Button
                        type="primary"
                        htmlType="submit"
                        className="register-button"
                        loading={loading}
                        size="large"
                    >
                        Criar Conta
                    </Button>
                </form>

                <div className="register-link">
                    Já tens conta? <Link to="/login">Fazer Login</Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterForm;