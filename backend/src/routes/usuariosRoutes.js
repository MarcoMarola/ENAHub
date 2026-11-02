
const express = require('express');
const { body, validationResult } = require('express-validator');

const {
    cadastrarUsuario,
    loginUsuario,
    listarUsuarios,
    atualizarUsuario,
    excluirUsuario
} = require('../controllers/usuariosController');

const autenticarToken = require('../middlewares/authMiddleware');

const router = express.Router();

// Middleware para validar os dados recebidos
const validarDados = (req, res, next) => {
    const erros = validationResult(req);

    if (!erros.isEmpty()) {
        return res.status(400).json({
            mensagem: 'Dados inválidos.',
            erros: erros.array()
        });
    }

    next();
};

// CREATE - Cadastrar usuário
router.post(
    '/',
    [
        body('nome')
            .trim()
            .notEmpty().withMessage('O nome é obrigatório.')
            .isLength({ max: 100 })
            .withMessage('O nome deve ter no máximo 100 caracteres.'),

        body('email')
            .trim()
            .isEmail().withMessage('Informe um e-mail válido.')
            .normalizeEmail(),

        body('senha')
            .isLength({ min: 8 })
            .withMessage('A senha deve ter pelo menos 8 caracteres.'),

        body('curso_id')
            .optional({ values: 'null' })
            .isInt({ min: 1 })
            .withMessage('O curso deve ter um ID válido.')
            .toInt()
    ],
    validarDados,
    cadastrarUsuario
);

// LOGIN - Autenticar usuário
router.post(
    '/login',
    [
        body('email')
            .isEmail().withMessage('Informe um e-mail válido.')
            .normalizeEmail(),

        body('senha')
            .notEmpty()
            .withMessage('A senha é obrigatória.')
    ],
    validarDados,
    loginUsuario
);

// READ - Consultar dados do usuário autenticado
router.get(
    '/',
    autenticarToken,
    listarUsuarios
);

// GET /usuarios/me - Perfil autenticado
router.get(
    '/me',
    autenticarToken,
    (req, res) => {
        return res.status(200).json({
            usuario: req.usuario
        });
    }
);

// UPDATE - Atualizar nome do usuário
router.put(
    '/:id',
    autenticarToken,
    [
        body('nome')
            .isString()
            .withMessage('O nome deve ser um texto.')
            .trim()
            .notEmpty()
            .withMessage('O nome é obrigatório.')
            .isLength({ max: 100 })
            .withMessage('O nome deve ter no máximo 100 caracteres.')
    ],
    validarDados,
    atualizarUsuario
);

// DELETE - Excluir usuário
router.delete(
    '/:id',
    autenticarToken,
    excluirUsuario
);

module.exports = router;
