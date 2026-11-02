
import { useEffect, useState } from 'react';

function Dashboard({ usuario, onSair, onEstudar, onHistorico }) {
    const [cursos, setCursos] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    // Buscar cursos no backend
    useEffect(() => {
        const carregarCursos = async () => {
            try {
                const resposta = await fetch(
                    'http://localhost:3000/cursos'
                );

                if (!resposta.ok) {
                    throw new Error('Erro ao buscar cursos.');
                }

                const dados = await resposta.json();
                setCursos(dados);

            } catch (erro) {
                console.error('Erro ao carregar cursos:', erro);
                setErro('Não foi possível carregar os cursos.');
            } finally {
                setCarregando(false);
            }
        };

        carregarCursos();
    }, []);

    return (
        <div className="container py-4">
            {/* Cabeçalho */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>ENAHub</h1>

                <div className="d-flex gap-2">
                    <button
                        className="btn btn-outline-primary"
                        onClick={onHistorico}
                    >
                        Histórico
                    </button>

                    <button
                        className="btn btn-outline-danger"
                        onClick={onSair}
                    >
                        Sair
                    </button>
                </div>
            </div>

            {/* Boas-vindas */}
            <h2>Bem-vindo, {usuario.nome}!</h2>

            <p className="text-muted">
                Escolha um curso para começar a estudar para o ENADE.
            </p>

            {/* Cursos */}
            <h3 className="mt-4 mb-3">
                Cursos disponíveis
            </h3>

            {carregando && (
                <p>Carregando cursos...</p>
            )}

            {erro && (
                <div className="alert alert-danger">
                    {erro}
                </div>
            )}

            {!carregando && !erro && cursos.length === 0 && (
                <div className="alert alert-info">
                    Nenhum curso disponível no momento.
                </div>
            )}

            <div className="row g-3">
                {cursos.map((curso) => (
                    <div
                        className="col-md-6"
                        key={curso.id}
                    >
                        <div className="card h-100 shadow-sm">
                            <div className="card-body">
                                <h5 className="card-title">
                                    {curso.nome}
                                </h5>

                                <p className="card-text text-muted">
                                    Prepare-se para o ENADE com questões do seu curso.
                                </p>

                                <button
                                    className="btn btn-primary"
                                    onClick={() => onEstudar(curso)}
                                >
                                    Estudar
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Dashboard;
