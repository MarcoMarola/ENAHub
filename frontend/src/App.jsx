
import { useEffect, useState } from 'react';
import Dashboard from './pages/Dashboard';
import Questoes from './pages/Questoes';
import Historico from './pages/Historico';
import Cadastro from './pages/Cadastro';
import Perfil from './pages/Perfil';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [verificandoSessao, setVerificandoSessao] = useState(true);

    const [usuario, setUsuario] = useState(null);
    const [cursoSelecionado, setCursoSelecionado] = useState(null);
    const [mostrarHistorico, setMostrarHistorico] = useState(false);
    const [mostrarCadastro, setMostrarCadastro] = useState(false);
    const [mostrarPerfil, setMostrarPerfil] = useState(false);

    useEffect(() => {
        const recuperarSessao = async () => {
            const token = sessionStorage.getItem('token');

            if (!token) {
                setVerificandoSessao(false);
                return;
            }

            try {
                const resposta = await fetch(`${API_URL}/usuarios/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!resposta.ok) {
                    throw new Error('Sessão inválida ou expirada.');
                }

                const dados = await resposta.json();
                setUsuario(dados.usuario);
            } catch (erro) {
                console.error('Erro ao recuperar sessão:', erro);
                sessionStorage.removeItem('token');
                setUsuario(null);
            } finally {
                setVerificandoSessao(false);
            }
        };

        recuperarSessao();
    }, []);

    const fazerLogin = async (evento) => {
        evento.preventDefault();
        setMensagem('');
        setCarregando(true);

        try {
            const resposta = await fetch(`${API_URL}/usuarios/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, senha })
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                setMensagem(dados.mensagem || 'Erro ao entrar.');
                return;
            }

            sessionStorage.setItem('token', dados.token);
            setUsuario(dados.usuario);
            setCursoSelecionado(null);
            setMostrarHistorico(false);
            setMostrarCadastro(false);
            setMostrarPerfil(false);
        } catch (erro) {
            console.error('Erro no login:', erro);
            setMensagem('Não foi possível conectar ao servidor.');
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
        setMostrarHistorico(false);
        setMostrarCadastro(false);
        setMostrarPerfil(false);
    };

    if (verificandoSessao) {
        return (
            <div className="container d-flex justify-content-center align-items-center min-vh-100">
                <div className="text-center">
                    <div className="spinner-border text-primary mb-3" role="status" />
                    <p>Verificando sessão...</p>
                </div>
            </div>
        );
    }

    if (usuario) {
        if (mostrarPerfil) {
            return (
                <Perfil
                    usuario={usuario}
                    onAtualizar={(dados) => setUsuario((anterior) => ({
                        ...anterior,
                        ...dados
                    }))}
                    onExcluir={sair}
                    onVoltar={() => setMostrarPerfil(false)}
                />
            );
        }

        if (mostrarHistorico) {
            return (
                <Historico
                    onVoltar={() => setMostrarHistorico(false)}
                />
            );
        }

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
                onHistorico={() => setMostrarHistorico(true)}
                onPerfil={() => setMostrarPerfil(true)}
            />
        );
    }

    if (mostrarCadastro) {
        return (
            <Cadastro
                onVoltar={() => setMostrarCadastro(false)}
            />
        );
    }

    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-100 py-4">
            <div
                className="card shadow p-4"
                style={{ width: '420px', maxWidth: '100%' }}
            >
                <div className="text-center mb-4">
                    <div
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '58px',
                            height: '58px',
                            borderRadius: '18px',
                            background: 'rgba(149, 101, 255, 0.15)',
                            color: '#b69aff',
                            fontSize: '28px',
                            fontWeight: '800',
                            marginBottom: '12px'
                        }}
                    >
                        E
                    </div>

                    <h1 className="mb-2">ENAHub</h1>

                    <p style={{ color: '#aab4cb' }}>
                        Sua jornada de preparação para o ENADE começa aqui.
                    </p>
                </div>

                <h4 className="mb-4" style={{ color: '#f5f6ff' }}>
                    Bem-vindo de volta
                </h4>

                <form onSubmit={fazerLogin}>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">
                            E-mail
                        </label>

                        <input
                            id="email"
                            type="email"
                            className="form-control"
                            placeholder="Digite seu e-mail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="senha" className="form-label">
                            Senha
                        </label>

                        <input
                            id="senha"
                            type="password"
                            className="form-control"
                            placeholder="Digite sua senha"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
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
                        disabled={carregando}
                        style={{ width: '100%' }}
                    >
                        {carregando ? 'Entrando...' : 'Entrar na plataforma'}
                    </button>
                </form>

                <div
                    className="text-center mt-4"
                    style={{ color: '#aab4cb', fontSize: '14px' }}
                >
                    Não tem uma conta?{' '}
                    <button
                        type="button"
                        onClick={() => {
                            setMensagem('');
                            setMostrarCadastro(true);
                        }}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            boxShadow: 'none',
                            padding: '0',
                            color: '#67d5ff',
                            fontWeight: '700',
                            textDecoration: 'underline',
                            textUnderlineOffset: '4px',
                            borderRadius: '0'
                        }}
                    >
                        Cadastre-se
                    </button>
                </div>
            </div>
        </div>
    );
}

export default App;
