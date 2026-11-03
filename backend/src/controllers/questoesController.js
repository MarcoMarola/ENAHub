
const db = require('../database');

const validarQuestao = (dados) => {
    const campos = [
        'enunciado',
        'alternativa_a',
        'alternativa_b',
        'alternativa_c',
        'alternativa_d',
        'alternativa_e'
    ];

    for (const campo of campos) {
        if (
            typeof dados[campo] !== 'string' ||
            !dados[campo].trim()
        ) {
            return `${campo} é obrigatório.`;
        }

        if (
            campo !== 'enunciado' &&
            dados[campo].trim().length > 255
        ) {
            return `${campo} deve ter até 255 caracteres.`;
        }
    }

    if (
        typeof dados.resposta_correta !== 'string' ||
        !['A', 'B', 'C', 'D', 'E'].includes(
            dados.resposta_correta.toUpperCase()
        )
    ) {
        return 'A resposta correta deve ser A, B, C, D ou E.';
    }

    const cursoId = Number(dados.curso_id);

    if (
        dados.curso_id === null ||
        dados.curso_id === undefined ||
        dados.curso_id === '' ||
        !Number.isSafeInteger(cursoId) ||
        cursoId < 1
    ) {
        return 'Informe um ID de curso válido.';
    }

    return null;
};

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

const listarQuestoesAdmin = async (req, res) => {
    try {
        const [questoes] = await db.query(`
            SELECT
                id,
                enunciado,
                alternativa_a,
                alternativa_b,
                alternativa_c,
                alternativa_d,
                alternativa_e,
                resposta_correta,
                curso_id
            FROM questoes
            ORDER BY id ASC
        `);

        return res.status(200).json(questoes);
    } catch (erro) {
        console.error('Erro ao listar questões administrativas:', erro);

        return res.status(500).json({
            mensagem: 'Erro interno ao consultar questões.'
        });
    }
};

const cadastrarQuestao = async (req, res) => {
    try {
        const erroValidacao = validarQuestao(req.body);

        if (erroValidacao) {
            return res.status(400).json({
                mensagem: erroValidacao
            });
        }

        const {
            enunciado,
            alternativa_a,
            alternativa_b,
            alternativa_c,
            alternativa_d,
            alternativa_e,
            resposta_correta,
            curso_id
        } = req.body;

        const [resultado] = await db.query(
            `INSERT INTO questoes (
                enunciado,
                alternativa_a,
                alternativa_b,
                alternativa_c,
                alternativa_d,
                alternativa_e,
                resposta_correta,
                curso_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                enunciado.trim(),
                alternativa_a.trim(),
                alternativa_b.trim(),
                alternativa_c.trim(),
                alternativa_d.trim(),
                alternativa_e.trim(),
                resposta_correta.toUpperCase(),
                Number(curso_id)
            ]
        );

        return res.status(201).json({
            mensagem: 'Questão cadastrada com sucesso!',
            id: resultado.insertId
        });
    } catch (erro) {
        if (erro.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({
                mensagem: 'Curso informado não existe.'
            });
        }

        console.error('Erro ao cadastrar questão:', erro);

        return res.status(500).json({
            mensagem: 'Erro interno ao cadastrar questão.'
        });
    }
};

const atualizarQuestao = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id < 1) {
            return res.status(400).json({
                mensagem: 'ID de questão inválido.'
            });
        }

        const erroValidacao = validarQuestao(req.body);

        if (erroValidacao) {
            return res.status(400).json({
                mensagem: erroValidacao
            });
        }

        const {
            enunciado,
            alternativa_a,
            alternativa_b,
            alternativa_c,
            alternativa_d,
            alternativa_e,
            resposta_correta,
            curso_id
        } = req.body;

        const [respostas] = await db.query(
            'SELECT id FROM respostas WHERE questao_id = ? LIMIT 1',
            [id]
        );

        if (respostas.length > 0) {
            return res.status(409).json({
                mensagem: 'Esta questão já foi respondida em um simulado e não pode ser editada.'
            });
        }

        const [resultado] = await db.query(
            `UPDATE questoes SET
                enunciado = ?,
                alternativa_a = ?,
                alternativa_b = ?,
                alternativa_c = ?,
                alternativa_d = ?,
                alternativa_e = ?,
                resposta_correta = ?,
                curso_id = ?
            WHERE id = ?`,
            [
                enunciado.trim(),
                alternativa_a.trim(),
                alternativa_b.trim(),
                alternativa_c.trim(),
                alternativa_d.trim(),
                alternativa_e.trim(),
                resposta_correta.toUpperCase(),
                Number(curso_id),
                id
            ]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: 'Questão não encontrada.'
            });
        }

        return res.status(200).json({
            mensagem: 'Questão atualizada com sucesso!'
        });
    } catch (erro) {
        if (erro.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({
                mensagem: 'Curso informado não existe.'
            });
        }

        console.error('Erro ao atualizar questão:', erro);

        return res.status(500).json({
            mensagem: 'Erro interno ao atualizar questão.'
        });
    }
};

const excluirQuestao = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id < 1) {
            return res.status(400).json({
                mensagem: 'ID de questão inválido.'
            });
        }

        const [resultado] = await db.query(
            'DELETE FROM questoes WHERE id = ?',
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: 'Questão não encontrada.'
            });
        }

        return res.status(200).json({
            mensagem: 'Questão excluída com sucesso!'
        });
    } catch (erro) {
        if (
            erro.code === 'ER_ROW_IS_REFERENCED' ||
            erro.code === 'ER_ROW_IS_REFERENCED_2'
        ) {
            return res.status(409).json({
                mensagem: 'Esta questão possui respostas vinculadas e não pode ser excluída.'
            });
        }

        console.error('Erro ao excluir questão:', erro);

        return res.status(500).json({
            mensagem: 'Erro interno ao excluir questão.'
        });
    }
};

module.exports = {
    listarQuestoes,
    listarQuestoesAdmin,
    cadastrarQuestao,
    atualizarQuestao,
    excluirQuestao
};
