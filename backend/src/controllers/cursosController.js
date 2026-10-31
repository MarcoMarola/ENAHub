
const db = require('../database');

const listarCursos = async (req, res) => {
    try {
        const [cursos] = await db.query(
            'SELECT id, nome FROM cursos ORDER BY nome ASC'
        );

        return res.status(200).json(cursos);

    } catch (erro) {
        console.error('Erro ao listar cursos:', erro);

        return res.status(500).json({
            mensagem: 'Erro interno ao consultar cursos.'
        });
    }
};

module.exports = { listarCursos };

