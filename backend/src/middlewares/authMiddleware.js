
const jwt = require('jsonwebtoken');

const autenticarToken = (req, res, next) => {
    const authorization = req.headers.authorization;

    if (!authorization || !/^Bearer \S+$/i.test(authorization)) {
        return res.status(401).json({
            mensagem: 'Token não fornecido ou formato inválido.'
        });
    }

    const token = authorization.split(' ')[1];

    try {
        const dados = jwt.verify(
            token,
            process.env.JWT_SECRET,
            { algorithms: ['HS256'] }
        );

        req.usuario = dados;

        next();
    } catch (erro) {
        return res.status(401).json({
            mensagem: 'Token inválido ou expirado.'
        });
    }
};

module.exports = autenticarToken;
