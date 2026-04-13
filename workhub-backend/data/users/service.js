// data/users/service.js
const bcrypt = require('bcryptjs');
const config = require('../../server/config');   // caminho para o config.js que criámos

function UserService(User) {

    // Cria password encriptada
    function createPassword(user) {
        return bcrypt.hash(user.password, config.saltRounds);
    }

    // Verifica se a password está correta
    function comparePassword(password, hash) {
        return bcrypt.compare(password, hash);
    }

    // Middleware de autorização (igual ao das aulas)
    function authorize(scopes) {
        return (request, response, next) => {
            const { roleUser } = request;   // vem do middleware de autenticação

            console.log("route scopes:", scopes);
            console.log("user scopes:", roleUser);

            const hasAuthorization = scopes.some((scope) => 
                roleUser.scopes.includes(scope)
            );

            if (roleUser && hasAuthorization) {
                next();
            } else {
                response.status(403).json({ message: "Forbidden - Acesso negado" });
            }
        };
    }

    return {
        createPassword,
        comparePassword,
        authorize
    };
}

module.exports = UserService;