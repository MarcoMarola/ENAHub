require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./database');
const usuariosRoutes = require('./routes/usuariosRoutes');
const helmet = require('helmet');
const autenticarToken = require('./middlewares/authMiddleware');
const cursosRoutes = require('./routes/cursosRoutes');
const questoesRoutes = require('./routes/questoesRoutes');
const simuladosRoutes = require('./routes/simuladosRoutes');

console.log('USUARIO:', process.env.DB_USER);
console.log('BANCO:', process.env.DB_NAME);

const app = express();
app.use(helmet());
app.use(cors());
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
        const [resultado] = await db.query('SELECT 1 AS teste');

        res.json({
            mensagem: 'Conexão com MySQL funcionando!',
            resultado: resultado
        });
    } catch (erro) {
        console.error(erro);

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


const PORT = 3000;

console.log('ROTA TESTE-DB CARREGADA');

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});