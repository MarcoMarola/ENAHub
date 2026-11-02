
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const db = require('./database');

const autenticarToken = require('./middlewares/authMiddleware');

const usuariosRoutes = require('./routes/usuariosRoutes');
const cursosRoutes = require('./routes/cursosRoutes');
const questoesRoutes = require('./routes/questoesRoutes');
const simuladosRoutes = require('./routes/simuladosRoutes');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(helmet());

const origensPermitidas = [
    'http://localhost:5173',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: origensPermitidas
}));

app.use(express.json());

app.use('/usuarios', usuariosRoutes);
app.use('/cursos', cursosRoutes);
app.use('/questoes', questoesRoutes);
app.use('/simulados', simuladosRoutes);

app.get('/', (req, res) => {
    res.json({
        mensagem: 'API do ENAHub funcionando!'
    });
});

app.get('/teste-db', async (req, res) => {
    try {
        const [resultado] = await db.query(
            'SELECT 1 AS teste'
        );

        res.json({
            mensagem: 'Conexão com MySQL funcionando!',
            resultado
        });

    } catch (erro) {
        console.error('Erro no banco:', erro);

        res.status(500).json({
            mensagem: 'Erro ao conectar com MySQL.'
        });
    }
});

app.get('/perfil', autenticarToken, (req, res) => {
    res.status(200).json({
        mensagem: 'Acesso autorizado!',
        usuario: req.usuario
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
