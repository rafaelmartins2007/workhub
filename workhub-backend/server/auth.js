// server/auth.js
const User = require('../data/users/user');
const userService = require('../data/users');
const jwt = require('jsonwebtoken');
const config = require('./config');

function AuthController() {

    // Regista um novo utilizador na plataforma.
    async function register(req, res) {
        try {
            const { nome, email, contacto, morada, nif, atividade, empresa, password, role } = req.body;

            // Verificar se já existe um utilizador com este email
            const userExists = await User.findOne({ email });
            if (userExists) return res.status(400).json({ message: "Email já registado" });

            // Verificar se já existe um utilizador com este NIF
            const nifExists = await User.findOne({ nif });
            if (nifExists) return res.status(400).json({ message: "NIF já registado" });

            // Criar o documento do novo utilizador.
            let newUser = new User({ nome, email, contacto, morada, nif, atividade, empresa, password, role: role || "client" });

            // Encriptar a password antes de guardar (bcrypt com saltRounds do confi
            newUser.password = await userService.createPassword(newUser);

            // Persistir na base de dados
            await newUser.save();

            // Resposta de sucesso
            res.status(201).json({ 
                message: "Utilizador criado com sucesso",
                user: { id: newUser._id, nome: newUser.nome, email: newUser.email, role: newUser.role }
            });
        } catch (error) {
            res.status(500).json({ message: "Erro ao registar utilizador", error: error.message });
        }
    }

    // Autentica um utilizador e devolve um token JWT.
    async function login(req, res) {
        try {
            const { email, password } = req.body;

            // Procurar utilizador pelo email
            const user = await User.findOne({ email });

            // Se não existe ou password errada
            if (!user) return res.status(401).json({ message: "Email ou password incorretos" });

            // Conta suspensa → acesso negado com mensagem específica
            if (!user.ativo) return res.status(403).json({ message: "Conta suspensa. Contacte o administrador." });

            // Comparar password enviada com o hash bcrypt armazenado
            const isPasswordValid = await userService.comparePassword(password, user.password);
            if (!isPasswordValid) return res.status(401).json({ message: "Email ou password incorretos" });

            // Gerar token JWT com os dados essenciais do utilizador.
            const token = jwt.sign(
                { id: user._id, email: user.email, role: user.role, ativo: user.ativo },
                config.secret,
                { expiresIn: config.expiresPassword }
            );

            // Devolver o token e dados básicos do utilizador (sem password)
            res.json({
                message: "Login efetuado com sucesso",
                token,
                user: { id: user._id, nome: user.nome, email: user.email, role: user.role }
            });
        } catch (error) {
            res.status(500).json({ message: "Erro no login", error: error.message });
        }
    }

    // Inicia o processo de recuperação de password.
    async function forgotPassword(req, res) {
        try {

            // Verificar se existe utilizador com este email
            const { email } = req.body;
            const user = await User.findOne({ email });
            if (!user) return res.status(404).json({ message: "Não existe conta com este email" });

            // Gera token aleatório (crypto.randomBytes) e guarda-o na BD com expiração
            const resetToken = await userService.generateResetToken(user);

            // Em produção enviaria um email. Por agora devolvemos o token para testar
            res.json({
                message: "Pedido de recuperação enviado. Verifica o teu email.",
                resetToken
            });
        } catch (error) {
            res.status(500).json({ message: "Erro ao processar pedido", error: error.message });
        }
    }

    // Redefine a password usando o token de recuperação.
    async function resetPassword(req, res) {
        try {
            const { token, password } = req.body;

            // Validação básica dos campos obrigatórios
            if (!token || !password) return res.status(400).json({ message: "Token e password são obrigatórios" });

            // A lógica de verificação do token e atualização da password fica no service
            await userService.resetPassword(token, password);
            res.json({ message: "Password redefinida com sucesso. Podes fazer login com a nova password." });
        } catch (error) {
            // O service lança erro com a mensagem adequada (ex: "Token inválido ou expirado")
            res.status(400).json({ message: error.message });
        }
    }
    return { register, login, forgotPassword, resetPassword };
}

module.exports = AuthController();