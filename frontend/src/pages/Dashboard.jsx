
import { useEffect, useState } from 'react';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function Dashboard({ usuario, onSair, onEstudar, onHistorico, onPerfil }) {
    const [cursos, setCursos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    useEffect(() => {
        const carregarCursos = async () => {
            try {
                const resposta = await fetch(`${API_URL}/cursos`);
                if (!resposta.ok) throw new Error('Erro ao buscar cursos.');

                const dados = await resposta.json();
                setCursos(dados);
            } catch (err) {
                console.error('Erro ao carregar cursos:', err);
                setErro('Não foi possível carregar os cursos.');
            } finally {
                setCarregando(false);
            }
        };

        carregarCursos();
    }, []);

    const obterIcone = (nome) => {
        const valor = nome.toLowerCase();

        if (valor.includes('computação')) return '⌘';
        if (valor.includes('software')) return '</>';
        if (valor.includes('informação')) return '▤';
        if (valor.includes('administração')) return '◈';
        return '✦';
    };

    return (
        <div className="dashboard-page">
            <header className="dashboard-nav">
                <div className="container dashboard-nav-conteudo">
                    <div className="dashboard-marca">
                        <div className="dashboard-logo">E</div>
                        <h1>ENAHub</h1>
                    </div>

                    <nav className="dashboard-menu">
                        <button onClick={onHistorico}>Histórico</button>
                        <button onClick={onPerfil}>Meu Perfil</button>
                        <button className="dashboard-sair" onClick={onSair}>
                            Sair
                        </button>
                    </nav>
                </div>
            </header>

            <main className="container dashboard-conteudo">
                <section className="dashboard-boas-vindas">
                    <span>SEU ESPAÇO DE ESTUDOS</span>
                    <h2>Bem-vindo, {usuario.nome}!</h2>
                    <p>
                        Continue sua preparação para o ENADE.
                        Escolha um curso, pratique com questões
                        e acompanhe sua evolução.
                    </p>
                </section>

                <section>
                    <h2 className="dashboard-titulo">Cursos disponíveis</h2>
                    <p className="dashboard-subtitulo">
                        Escolha sua área de conhecimento para começar.
                    </p>

                    {carregando && <p>Carregando cursos...</p>}
                    {erro && <div className="alert alert-danger">{erro}</div>}

                    {!carregando && !erro && cursos.length === 0 && (
                        <div className="alert alert-info">
                            Nenhum curso disponível no momento.
                        </div>
                    )}

                    {!carregando && !erro && (
                        <div className="row g-4">
                            {cursos.map(curso => (
                                <div className="col-12 col-md-6" key={curso.id}>
                                    <article className="dashboard-card">
                                        <div className="dashboard-icone">
                                            {obterIcone(curso.nome)}
                                        </div>

                                        <h3>{curso.nome}</h3>
                                        <p>
                                            Prepare-se para o ENADE com questões
                                            selecionadas para sua área de conhecimento.
                                        </p>

                                        <button onClick={() => onEstudar(curso)}>
                                            Começar a estudar →
                                        </button>
                                    </article>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default Dashboard;
