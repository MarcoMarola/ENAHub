
import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import Questoes from './pages/Questoes';

function App() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [usuario, setUsuario] = useState(null);
    const [cursoSelecionado, setCursoSelecionado] = useState(null);

    const fazerLogin = async (evento) => {
        evento.preventDefault();

        setMensagem('');
        setCarregando(true);

        try {
            const resposta = await fetch(
                'http://localhost:3000/usuarios/login',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email,
                        senha
                    })
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                setMensagem(
                    dados.mensagem || 'Erro ao entrar.'
                );
                return;
            }

            // Guardar token JWT
            sessionStorage.setItem('token', dados.token);

            // Guardar usuário autenticado
            setUsuario(dados.usuario);

        } catch (erro) {
            console.error('Erro no login:', erro);

            setMensagem(
                'Não foi possível conectar ao servidor.'
            );

        } finally {
            setCarregando(false);
        }
    };

    const sair = () => {
        sessionStorage.removeItem('token');

        setUsuario(null);
        setEmail('');
        setSenha('');
        setMensagem('');
        setCursoSelecionado(null);
    };

    
if (usuario) {
    if (cursoSelecionado) {
        return (
            <Questoes
                curso={cursoSelecionado}
                onVoltar={() => setCursoSelecionado(null)}
            />
        );
    }

    return (
        <Dashboard
            usuario={usuario}
            onSair={sair}
            onEstudar={(curso) => setCursoSelecionado(curso)}
        />
    );
}


    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-100">
            <div
                className="card shadow p-4"
                style={{ width: '400px', maxWidth: '100%' }}
            >
                <h1 className="text-center mb-2">
                    ENAHub
                </h1>

                <p className="text-center text-muted mb-4">
                    Plataforma de preparação para o ENADE
                </p>

                <h4 className="mb-3">
                    Entrar
                </h4>

                <form onSubmit={fazerLogin}>
                    <div className="mb-3">
                        <label
                            htmlFor="email"
                            className="form-label"
                        >
                            E-mail
                        </label>

                        <input
                            id="email"
                            type="email"
                            className="form-control"
                            placeholder="Digite seu e-mail"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label
                            htmlFor="senha"
                            className="form-label"
                        >
                            Senha
                        </label>

                        <input
                            id="senha"
                            type="password"
                            className="form-control"
                            placeholder="Digite sua senha"
                            value={senha}
                            onChange={(e) =>
                                setSenha(e.target.value)
                            }
                            required
                        />
                    </div>

                    {mensagem && (
                        <div className="alert alert-danger">
                            {mensagem}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={carregando}
                    >
                        {carregando
                            ? 'Entrando...'
                            : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default App;
