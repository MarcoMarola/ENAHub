
const express = require('express');
const { listarCursos } = require('../controllers/cursosController');

const router = express.Router();

router.get('/', listarCursos);

module.exports = router;

