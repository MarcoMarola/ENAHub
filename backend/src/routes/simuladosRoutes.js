
const express = require('express');

const {
    criarSimulado,
    corrigirSimulado,
    listarSimulados
} = require('../controllers/simuladosController');

const autenticarToken = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', autenticarToken, criarSimulado);

router.get('/', autenticarToken, listarSimulados);

router.post('/:id/respostas', autenticarToken, corrigirSimulado);

module.exports = router;
