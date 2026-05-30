// server/auth.js
const User = require('../data/users/user');
const userService = require('../data/users');
const jwt = require('jsonwebtoken');
const config = require('./config');

function AuthController() {

    // Regista um novo utilizador na plataforma.
    function register(req, res, next) {
        const { nome, email, contacto, morada, nif, atividade, empresa, password, role } = req.body;

        // 1. Verifica se o email já está em uso
        User.findOne({ email })
            .then((userExists) => {
                if (userExists) {
                    return Promise.reject({ status: 400, message: "Email já registado" });
                }
                // 2. Verifica se o NIF já está em uso
                return User.findOne({ nif });
            })
            .then((nifExists) => {
                if (nifExists) {
                    return Promise.reject({ status: 400, message: "NIF já registado" });
                }
                // 3. Prepara o novo utilizador (role padrão é "client")
                let newUser = new User({ nome, email, contacto, morada, nif, atividade, empresa, password, role: role || "client" });
                // 4. Encripta a password antes de guardar
                return userService.createPassword(newUser)
                    .then((passwordHash) => {
                        newUser.password = passwordHash;
                        return newUser.save(); // 5. Guarda na base de dados
                    })
                    .then(() => {
                        res.status(201).json({
                            message: "Utilizador criado com sucesso",
                            user: { id: newUser._id, nome: newUser.nome, email: newUser.email, role: newUser.role }
                        });
                    });
            })
            .catch((err) => {
                // Tratamento de erros centralizado para o registo
                if (err.status) {
                    return res.status(err.status).json({ message: err.message });
                }
                res.status(500).json({ message: "Erro ao registar utilizador", error: err.message });
                next();
            });
    }

    // Autentica um utilizador e devolve um token JWT.
    function login(req, res, next) {
        const { email, password } = req.body;

        // 1. Procura o utilizador pelo email
        User.findOne({ email })
            .then((user) => {
                if (!user) {
                    return Promise.reject({ status: 401, message: "Email ou password incorretos" });
                }
                // 2. Verifica se a conta não está suspensa
                if (!user.ativo) {
                    return Promise.reject({ status: 403, message: "Conta suspensa. Contacte o administrador." });
                }
                // 3. Compara a password enviada com o hash na BD
                return userService.comparePassword(password, user.password)
                    .then((isValid) => {
                        if (!isValid) {
                            return Promise.reject({ status: 401, message: "Email ou password incorretos" });
                        }
                        // 4. Gera o Token JWT com os dados do utilizador
                        const token = jwt.sign(
                            { id: user._id, email: user.email, role: user.role, ativo: user.ativo },
                            config.secret,
                            { expiresIn: config.expiresPassword }
                        );
                        res.status(200).json({
                            auth: true,
                            token,
                            user: { id: user._id, nome: user.nome, email: user.email, role: user.role }
                        });
                    });
            })
            .catch((err) => {
                // Tratamento de erros de autenticação
                if (err.status) {
                    return res.status(err.status).json({ auth: false, message: err.message });
                }
                res.status(500).json({ auth: false, message: "Erro no login", error: err.message });
                next();
            });
    }

    // Termina a sessão — invalida o token pelo lado do cliente.
    function logout(req, res, next) {
        return new Promise(() => {
            // No JWT, o logout é maioritariamente gerido pelo cliente removendo o token
            res.status(200).json({ auth: false, message: "Logout efetuado com sucesso" });
        }).catch((err) => {
            res.status(500).json({ message: "Erro no logout", error: err.message });
            next();
        });
    }

    // Inicia o processo de recuperação de password.
    function forgotPassword(req, res, next) {
        const { email } = req.body;

        // 1. Verifica se o email existe
        User.findOne({ email })
            .then((user) => {
                if (!user) {
                    return Promise.reject({ status: 404, message: "Não existe conta com este email" });
                }
                // 2. Gera um token temporário para recuperação
                return userService.generateResetToken(user);
            })
            .then((resetToken) => {
                res.json({
                    message: "Pedido de recuperação enviado. Verifica o teu email.",
                    resetToken
                });
            })
            .catch((err) => {
                // Erro no processo de pedido de recuperação
                if (err.status) {
                    return res.status(err.status).json({ message: err.message });
                }
                res.status(500).json({ message: "Erro ao processar pedido", error: err.message });
                next();
            });
    }

    // Redefine a password usando o token de recuperação.
    function resetPassword(req, res, next) {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ message: "Token e password são obrigatórios" });
        }

        // Chama o serviço para validar o token e atualizar a password
        userService.resetPassword(token, password)
            .then(() => {
                res.json({ message: "Password redefinida com sucesso. Podes fazer login com a nova password." });
            })
            .catch((err) => {
                res.status(400).json({ message: err.message });
                next();
            });
    }

    return { register, login, logout, forgotPassword, resetPassword };
}

module.exports = AuthController();