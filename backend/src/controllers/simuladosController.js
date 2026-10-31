
const db = require('../database');

const criarSimulado = async (req, res) => {
    try {
        const usuario_id = req.usuario.id;

        const [resultado] = await db.query(
            'INSERT INTO simulados (usuario_id) VALUES (?)',
            [usuario_id]
        );

        return res.status(201).json({
            mensagem: 'Simulado criado com sucesso!',
            simulado: {
                id: resultado.insertId,
                usuario_id
            }
        });

    } catch (erro) {
        console.error('Erro ao criar simulado:', erro);

        return res.status(500).json({
            mensagem: 'Erro interno ao criar simulado.'
        });
    }
};

const corrigirSimulado = async (req, res) => {
    const simuladoId = Number(req.params.id);
    const usuarioId = req.usuario.id;
    const { respostas } = req.body;

    if (!Number.isSafeInteger(simuladoId) || simuladoId < 1) {
        return res.status(400).json({
            mensagem: 'ID do simulado inválido.'
        });
    }

    if (!Array.isArray(respostas) || respostas.length === 0) {
        return res.status(400).json({
            mensagem: 'Envie uma lista de respostas.'
        });
    }

    const ids = new Set();

    for (const item of respostas) {
        if (
            !item ||
            !Number.isSafeInteger(item.questao_id) ||
            item.questao_id < 1 ||
            typeof item.resposta !== 'string' ||
            !/^[A-E]$/.test(item.resposta) ||
            ids.has(item.questao_id)
        ) {
            return res.status(400).json({
                mensagem: 'Respostas inválidas ou questões duplicadas.'
            });
        }

        ids.add(item.questao_id);
    }

    let conexao;

    try {
        conexao = await db.getConnection();
        await conexao.beginTransaction();

        const [simulados] = await conexao.query(
            `SELECT id FROM simulados
             WHERE id = ? AND usuario_id = ?
             FOR UPDATE`,
            [simuladoId, usuarioId]
        );

        if (simulados.length === 0) {
            await conexao.rollback();

            return res.status(404).json({
                mensagem: 'Simulado não encontrado.'
            });
        }

        const [anteriores] = await conexao.query(
            `SELECT id FROM respostas
             WHERE simulado_id = ? LIMIT 1`,
            [simuladoId]
        );

        if (anteriores.length > 0) {
            await conexao.rollback();

            return res.status(409).json({
                mensagem: 'Este simulado já foi respondido.'
            });
        }

        const questaoIds = [...ids];

        const [questoes] = await conexao.query(
            `SELECT id, resposta_correta
             FROM questoes
             WHERE id IN (?)`,
            [questaoIds]
        );

        if (questoes.length !== respostas.length) {
            await conexao.rollback();

            return res.status(400).json({
                mensagem: 'Uma ou mais questões não existem.'
            });
        }

        const gabarito = new Map(
            questoes.map(q => [q.id, q.resposta_correta])
        );

        let acertos = 0;

        for (const item of respostas) {
            if (item.resposta === gabarito.get(item.questao_id)) {
                acertos++;
            }

            await conexao.query(
                `INSERT INTO respostas
                 (simulado_id, questao_id, resposta)
                 VALUES (?, ?, ?)`,
                [simuladoId, item.questao_id, item.resposta]
            );
        }

        const erros = respostas.length - acertos;

        const percentual = Number(
            ((acertos / respostas.length) * 100).toFixed(2)
        );

        await conexao.query(
            `UPDATE simulados
             SET acertos = ?, erros = ?, percentual = ?
             WHERE id = ?`,
            [acertos, erros, percentual, simuladoId]
        );

        await conexao.commit();

        return res.status(200).json({
            mensagem: 'Simulado corrigido com sucesso!',
            resultado: {
                simulado_id: simuladoId,
                acertos,
                erros,
                percentual
            }
        });

    } catch (erro) {
        if (conexao) {
            await conexao.rollback();
        }

        console.error('Erro ao corrigir simulado:', erro);

        return res.status(500).json({
            mensagem: 'Erro interno ao corrigir simulado.'
        });

    } finally {
        if (conexao) {
            conexao.release();
        }
    }
};

const listarSimulados = async (req, res) => {
    try {
        const usuarioId = req.usuario.id;

        const [simulados] = await db.query(
            `SELECT
                id,
                data_realizacao,
                acertos,
                erros,
                percentual
             FROM simulados
             WHERE usuario_id = ?
             ORDER BY data_realizacao DESC, id DESC`,
            [usuarioId]
        );

        return res.status(200).json(simulados);

    } catch (erro) {
        console.error('Erro ao listar simulados:', erro);

        return res.status(500).json({
            mensagem: 'Erro interno ao consultar simulados.'
        });
    }
};

module.exports = {
    criarSimulado,
    corrigirSimulado,
    listarSimulados
};
