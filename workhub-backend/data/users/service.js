// data/users/service.js
// Serviço com a lógica de negócio dos utilizadores: passwords, update, recuperação.

const bcrypt = require('bcryptjs');  // biblioteca para encriptar/comparar passwords
const crypto = require('crypto');    // módulo nativo do Node para gerar bytes aleatórios
const config = require('../../server/config');

function UserService(User) { // recebe o modelo User por injeção de dependência

    // Encripta a password do utilizador usando bcrypt.
    // saltRounds (config) = "custo" do hash — quanto maior, mais seguro mas mais lento.
    function createPassword(user) {
        return bcrypt.hash(user.password, config.saltRounds);
    }

    // Compara a password com o hash guardado na BD.
    // bcrypt.compare devolve true/false
    function comparePassword(password, hash) {
        return bcrypt.compare(password, hash);
    }

    // Gera um token aleatório para recuperação de password e guarda-o no utilizador.
    async function generateResetToken(user) {
        const token = crypto.randomBytes(32).toString('hex'); // 64 caracteres hex aleatórios
        const expires = Date.now() + 3600000; // agora + 1 hora (em milissegundos)

        user.resetPasswordToken = token;
        user.resetPasswordExpires = expires;
        await user.save(); // persiste o token e a expiração na BD

        return token;
    }

    // Redefine a password usando o token de recuperação.
    async function resetPassword(token, newPassword) {
        // Procura um utilizador cujo token corresponde E ainda não expirou ($gt = greater than)
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() } // garante que o token ainda é válido
        });

        if (!user) {
            throw new Error("Token inválido ou expirado"); // apanhado pelo auth.js e devolvido ao cliente
        }

        user.password = await createPassword({ password: newPassword }); // encripta a nova password
        user.resetPasswordToken = null;   // limpa o token (só pode ser usado uma vez)
        user.resetPasswordExpires = null; // limpa a expiração

        await user.save();
        return user;
    }

    // Atualiza os campos de um utilizador na BD.
    function update(id, updates) {
        return new Promise(async (resolve, reject) => {
            try {
                if (updates.password !== undefined) {
                    delete updates.password;   // ou podes fazer throw new Error(...) se preferires
                }
                delete updates._id; // remove _id do objeto para não tentar sobrescrever o ID do documento

                // findByIdAndUpdate → atualiza e devolve o documento atualizado (new: true)
                // runValidators: aplica as validações do schema na atualização
                const updatedUser = await User.findByIdAndUpdate(id, updates, { returnDocument: 'after', runValidators: true })
                    .select('-password');
                if (!updatedUser) return reject(new Error("Utilizador não encontrado"));
                resolve(updatedUser);
            } catch (error) {
                reject(error);
            }
        });
    }

    return { createPassword, comparePassword, update, generateResetToken, resetPassword };
}

module.exports = UserService;