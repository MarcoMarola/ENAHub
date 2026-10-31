
const bcrypt = require('bcrypt');
const db = require('../database');
const jwt = require('jsonwebtoken');

const cadastrarUsuario = async (req, res) => {
    try {
        const { nome, email, senha, curso_id } = req.body;

        // Verifica se o e-mail já está cadastrado
        const [usuarios] = await db.query(
            'SELECT id FROM usuarios WHERE email = ?',
            [email]
        );

        if (usuarios.length > 0) {
            return res.status(409).json({
                mensagem: 'E-mail já cadastrado.'
            });
        }

        // Gera um hash seguro da senha
        const senhaHash = await bcrypt.hash(senha, 12);

        // Salva o usuário no banco de dados
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


const loginUsuario = async (req, res) => {
    try {
        const { email, senha } = req.body;

        // Busca o usuário pelo e-mail
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

        // Compara a senha informada com o hash armazenado
        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

        if (!senhaCorreta) {
            return res.status(401).json({
                mensagem: 'E-mail ou senha inválidos.'
            });
        }

        // Gera um token JWT com validade de 2 horas
        const token = jwt.sign(
            { id: usuario.id },
            process.env.JWT_SECRET,
            { expiresIn: '2h', algorithm: 'HS256' }
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


module.exports = { cadastrarUsuario, loginUsuario };
