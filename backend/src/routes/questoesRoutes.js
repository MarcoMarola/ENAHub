
const express = require('express');
const { listarQuestoes } = require('../controllers/questoesController');

const router = express.Router();

// Rota para listar as questões
router.get('/', listarQuestoes);

module.exports = router;
