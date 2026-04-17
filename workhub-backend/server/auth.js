// server/auth.js
const User = require('../data/users/user');
const userService = require('../data/users');
const jwt = require('jsonwebtoken');
const config = require('./config');

function AuthController() {

    async function register(req, res) { /* mantido igual ao que tinhas */ 
        try {
            const { nome, email, contacto, morada, nif, atividade, empresa, password, role } = req.body;

            const userExists = await User.findOne({ email });
            if (userExists) return res.status(400).json({ message: "Email já registado" });

            const nifExists = await User.findOne({ nif });
            if (nifExists) return res.status(400).json({ message: "NIF já registado" });

            let newUser = new User({ nome, email, contacto, morada, nif, atividade, empresa, password, role: role || "client" });

            newUser.password = await userService.createPassword(newUser);
            await newUser.save();

            res.status(201).json({ 
                message: "Utilizador criado com sucesso",
                user: { id: newUser._id, nome: newUser.nome, email: newUser.email, role: newUser.role }
            });
        } catch (error) {
            res.status(500).json({ message: "Erro ao registar utilizador", error: error.message });
        }
    }

    async function login(req, res) { /* mantido igual ao que tinhas */ 
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });
            if (!user) return res.status(401).json({ message: "Email ou password incorretos" });
            if (!user.ativo) return res.status(403).json({ message: "Conta suspensa. Contacte o administrador." });

            const isPasswordValid = await userService.comparePassword(password, user.password);
            if (!isPasswordValid) return res.status(401).json({ message: "Email ou password incorretos" });

            const token = jwt.sign(
                { id: user._id, email: user.email, role: user.role, ativo: user.ativo },
                config.secret,
                { expiresIn: config.expiresPassword }
            );

            res.json({
                message: "Login efetuado com sucesso",
                token,
                user: { id: user._id, nome: user.nome, email: user.email, role: user.role }
            });
        } catch (error) {
            res.status(500).json({ message: "Erro no login", error: error.message });
        }
    }

    // ====================== NOVA: ESQUECI A PASSWORD ======================
    async function forgotPassword(req, res) {
        try {
            const { email } = req.body;
            const user = await User.findOne({ email });
            if (!user) return res.status(404).json({ message: "Não existe conta com este email" });

            const resetToken = await userService.generateResetToken(user);

            // Em produção enviarias um email. Por agora devolvemos o token para testar
            res.json({
                message: "Pedido de recuperação enviado. Verifica o teu email.",
                resetToken   // ← apenas para testes (remove em produção)
            });
        } catch (error) {
            res.status(500).json({ message: "Erro ao processar pedido", error: error.message });
        }
    }

    // ====================== NOVA: REDEFINIR PASSWORD ======================
    async function resetPassword(req, res) {
        try {
            const { token, password } = req.body;

            if (!token || !password) return res.status(400).json({ message: "Token e password são obrigatórios" });

            await userService.resetPassword(token, password);

            res.json({ message: "Password redefinida com sucesso. Podes fazer login com a nova password." });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    return { register, login, forgotPassword, resetPassword };
}

module.exports = AuthController();