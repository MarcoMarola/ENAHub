
const db = require('../database');

const listarQuestoes = async (req, res) => {
    try {
        const { curso_id } = req.query;

        let sql = `
            SELECT
                id,
                enunciado,
                alternativa_a,
                alternativa_b,
                alternativa_c,
                alternativa_d,
                alternativa_e,
                curso_id
            FROM questoes
        `;

        const parametros = [];

        if (curso_id !== undefined) {
            const id = Number(curso_id);

            if (!Number.isSafeInteger(id) || id < 1) {
                return res.status(400).json({
                    mensagem: 'Informe um ID de curso válido.'
                });
            }

            sql += ' WHERE curso_id = ?';
            parametros.push(id);
        }

        sql += ' ORDER BY id ASC';

        const [questoes] = await db.query(sql, parametros);

        return res.status(200).json(questoes);

    } catch (erro) {
        console.error('Erro ao listar questões:', erro);

        return res.status(500).json({
            mensagem: 'Erro interno ao consultar questões.'
        });
    }
};

module.exports = { listarQuestoes };
