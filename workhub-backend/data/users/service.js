// data/users/service.js
const bcrypt = require('bcryptjs');
const crypto = require('crypto');        // ← novo
const config = require('../../server/config');

function UserService(User) {

    function createPassword(user) {
        return bcrypt.hash(user.password, config.saltRounds);
    }

    function comparePassword(password, hash) {
        console.log(hash);
        return bcrypt.compare(password, hash);
    }

    // ====================== RECUPERAÇÃO DE PASSWORD ======================
    async function generateResetToken(user) {
        const token = crypto.randomBytes(32).toString('hex');
        const expires = Date.now() + 3600000; // 1 hora

        user.resetPasswordToken = token;
        user.resetPasswordExpires = expires;
        await user.save();

        return token;
    }

    async function resetPassword(token, newPassword) {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            throw new Error("Token inválido ou expirado");
        }

        user.password = await createPassword({ password: newPassword });
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;

        await user.save();
        return user;
    }

    function update(id, updates) { /* mantido igual ao anterior */ 
        return new Promise(async (resolve, reject) => {
            try {
                if (updates.password) {
                    updates.password = await createPassword({ password: updates.password });
                }
                delete updates._id;

                const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
                    .select('-password');
                if (!updatedUser) return reject(new Error("Utilizador não encontrado"));
                resolve(updatedUser);
            } catch (error) {
                reject(error);
            }
        });
    }

    function authorize(scopes) { /* mantido igual */ 
        return (request, response, next) => {
            const { roleUser } = request;
            const hasAuthorization = scopes.some(scope => roleUser.scopes.includes(scope));
            if (roleUser && hasAuthorization) next();
            else response.status(403).json({ message: "Forbidden - Acesso negado" });
        };
    }

    return {
        createPassword,
        comparePassword,
        update,
        authorize,
        generateResetToken,   // ← novo
        resetPassword         // ← novo
    };
}

module.exports = UserService;