
const bcrypt = require('bcrypt');
const db = require('../database');
const jwt = require('jsonwebtoken');

// CREATE - Cadastrar usuário
const cadastrarUsuario = async (req, res) => {
    try {
        const { nome, email, senha, curso_id } = req.body;

        const [usuarios] = await db.query(
            'SELECT id FROM usuarios WHERE email = ?',
            [email]
        );

        if (usuarios.length > 0) {
            return res.status(409).json({
                mensagem: 'E-mail já cadastrado.'
            });
        }

        const senhaHash = await bcrypt.hash(senha, 12);

        const [resultado] = await db.query(
            'INSERT INTO usuarios (nome, email, senha, curso_id) VALUES (?, ?, ?, ?)',
            [nome, email, senhaHash, curso_id ?? null]
        );

        return res.status(201).json({
            mensagem: 'Usuário cadastrado com sucesso!',
            usuario: {
                id: resultado.insertId,
                nome,
                email,
                curso_id: curso_id ?? null
            }
        });
    } catch (erro) {
        console.error('Erro ao cadastrar usuário:', erro);

        if (erro.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                mensagem: 'E-mail já cadastrado.'
            });
        }

        return res.status(500).json({
            mensagem: 'Erro interno ao cadastrar usuário.'
        });
    }
};

// LOGIN - Autenticar usuário
const loginUsuario = async (req, res) => {
    try {
        const { email, senha } = req.body;

        const [usuarios] = await db.query(
            'SELECT id, nome, email, senha, curso_id FROM usuarios WHERE email = ?',
            [email]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({
                mensagem: 'E-mail ou senha inválidos.'
            });
        }

        const usuario = usuarios[0];
        const senhaCorreta = await bcrypt.compare(
            senha,
            usuario.senha
        );

        if (!senhaCorreta) {
            return res.status(401).json({
                mensagem: 'E-mail ou senha inválidos.'
            });
        }

        const token = jwt.sign(
            {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                curso_id: usuario.curso_id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '2h',
                algorithm: 'HS256'
            }
        );

        return res.status(200).json({
            mensagem: 'Login realizado com sucesso!',
            token,
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                curso_id: usuario.curso_id
            }
        });
    } catch (erro) {
        console.error('Erro ao realizar login:', erro);

        return res.status(500).json({
            mensagem: 'Erro interno ao realizar login.'
        });
    }
};

// READ - Consultar usuário autenticado
const listarUsuarios = async (req, res) => {
    try {
        const [usuarios] = await db.query(
            'SELECT id, nome, email, curso_id FROM usuarios WHERE id = ?',
            [req.usuario.id]
        );

        if (usuarios.length === 0) {
            return res.status(404).json({
                mensagem: 'Usuário não encontrado.'
            });
        }

        return res.status(200).json({ usuarios });
    } catch (erro) {
        console.error('Erro ao consultar usuário:', erro);

        return res.status(500).json({
            mensagem: 'Erro interno ao consultar usuário.'
        });
    }
};

// UPDATE - Atualizar nome do usuário
const atualizarUsuario = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { nome } = req.body;

        if (!Number.isSafeInteger(id) || id !== req.usuario.id) {
            return res.status(403).json({
                mensagem: 'Operação não autorizada.'
            });
        }

        if (
            typeof nome !== 'string' ||
            !nome.trim() ||
            nome.trim().length > 100
        ) {
            return res.status(400).json({
                mensagem: 'Informe um nome válido de até 100 caracteres.'
            });
        }

        const [resultado] = await db.query(
            'UPDATE usuarios SET nome = ? WHERE id = ?',
            [nome.trim(), id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: 'Usuário não encontrado.'
            });
        }

        return res.status(200).json({
            mensagem: 'Usuário atualizado com sucesso!'
        });
    } catch (erro) {
        console.error('Erro ao atualizar usuário:', erro);

        return res.status(500).json({
            mensagem: 'Erro interno ao atualizar usuário.'
        });
    }
};

// DELETE - Excluir usuário
const excluirUsuario = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isSafeInteger(id) || id !== req.usuario.id) {
            return res.status(403).json({
                mensagem: 'Operação não autorizada.'
            });
        }

        const [resultado] = await db.query(
            'DELETE FROM usuarios WHERE id = ?',
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                mensagem: 'Usuário não encontrado.'
            });
        }

        return res.status(200).json({
            mensagem: 'Usuário excluído com sucesso!'
        });
    } catch (erro) {
        if (
            erro.code === 'ER_ROW_IS_REFERENCED' ||
            erro.code === 'ER_ROW_IS_REFERENCED_2'
        ) {
            return res.status(409).json({
                mensagem: 'Não é possível excluir esta conta porque existem registros vinculados.'
            });
        }

        console.error('Erro ao excluir usuário:', erro);

        return res.status(500).json({
            mensagem: 'Erro interno ao excluir usuário.'
        });
    }
};

module.exports = {
    cadastrarUsuario,
    loginUsuario,
    listarUsuarios,
    atualizarUsuario,
    excluirUsuario
};
