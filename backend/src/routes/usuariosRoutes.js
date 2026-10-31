
const express = require('express');
const { body, validationResult } = require('express-validator');
const {
    cadastrarUsuario,
    loginUsuario
} = require('../controllers/usuariosController');

const router = express.Router();

// Rota de cadastro de usuários
router.post(
    '/',
    [
        body('nome')
            .trim()
            .notEmpty().withMessage('O nome é obrigatório.')
            .isLength({ max: 100 }).withMessage('O nome deve ter no máximo 100 caracteres.'),

        body('email')
            .trim()
            .isEmail().withMessage('Informe um e-mail válido.')
            .normalizeEmail(),

        body('senha')
            .isLength({ min: 8 }).withMessage('A senha deve ter pelo menos 8 caracteres.'),

        body('curso_id')
            .optional({ values: 'null' })
            .isInt({ min: 1 }).withMessage('O curso deve ter um ID válido.')
            .toInt()
    ],
    (req, res, next) => {
        const erros = validationResult(req);

        if (!erros.isEmpty()) {
            return res.status(400).json({
                mensagem: 'Dados inválidos.',
                erros: erros.array()
            });
        }

        next();
    },
    cadastrarUsuario
);


router.post(
    '/login',
    [
        body('email')
            .isEmail().withMessage('Informe um e-mail válido.')
            .normalizeEmail(),

        body('senha')
            .notEmpty().withMessage('A senha é obrigatória.')
    ],
    (req, res, next) => {
        const erros = validationResult(req);

        if (!erros.isEmpty()) {
            return res.status(400).json({
                mensagem: 'Dados inválidos.',
                erros: erros.array()
            });
        }

        next();
    },
    loginUsuario
);


module.exports = router;
