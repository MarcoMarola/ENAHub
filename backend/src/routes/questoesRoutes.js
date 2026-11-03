
const express = require('express');

const {
    listarQuestoes,
    listarQuestoesAdmin,
    cadastrarQuestao,
    atualizarQuestao,
    excluirQuestao
} = require('../controllers/questoesController');

const autenticarToken = require('../middlewares/authMiddleware');const somenteAdmin = require('../middlewares/somenteAdmin');

const router = express.Router();

router.get('/', listarQuestoes);

router.get(
    '/admin',
    autenticarToken,
    somenteAdmin,
    listarQuestoesAdmin
);

router.post(
    '/',
    autenticarToken,
    somenteAdmin,
    cadastrarQuestao
);

router.put(
    '/:id',
    autenticarToken,
    somenteAdmin,
    atualizarQuestao
);

router.delete(
    '/:id',
    autenticarToken,
    somenteAdmin,
    excluirQuestao
);

module.exports = router;
