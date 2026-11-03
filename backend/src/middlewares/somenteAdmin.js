
const db = require('../database');

const somenteAdmin = async (req, res, next) => {
    try {
        if (!req.usuario?.id) {
            return res.status(401).json({
                mensagem: 'Usuário não autenticado.'
            });
        }

        const [usuarios] = await db.query(
            'SELECT perfil FROM usuarios WHERE id = ?',
            [req.usuario.id]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({
                mensagem: 'Usuário não encontrado.'
            });
        }

        if (usuarios[0].perfil !== 'admin') {
            return res.status(403).json({
                mensagem: 'Acesso restrito a administradores.'
            });
        }

        next();
    } catch (erro) {
        console.error('Erro ao verificar administrador:', erro);

        return res.status(500).json({
            mensagem: 'Erro interno ao verificar permissões.'
        });
    }
};

module.exports = somenteAdmin;
