
import { useEffect, useState } from 'react';
import './Historico.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function Historico({ onVoltar }) {
    const [simulados, setSimulados] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    useEffect(() => {
        const carregar = async () => {
            try {
                const token = sessionStorage.getItem('token');
                if (!token) throw new Error('Sessão expirada. Faça login novamente.');

                const resposta = await fetch(`${API_URL}/simulados`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                const dados = await resposta.json();
                if (!resposta.ok) throw new Error(dados.mensagem || 'Erro ao carregar histórico.');
                if (!Array.isArray(dados)) throw new Error('Formato de histórico inválido.');

                setSimulados(dados);
            } catch (err) {
                setErro(err.message);
            } finally {
                setCarregando(false);
            }
        };

        carregar();
    }, []);

    const formatarData = (data) => {
        if (!data) return 'Data indisponível';
        const valor = new Date(data);
        return Number.isNaN(valor.getTime())
            ? 'Data inválida'
            : valor.toLocaleString('pt-BR');
    };

    const formatarNota = (valor) => {
        if (valor === null || valor === undefined || valor === '') return '-';
        const numero = Number(valor);
        return Number.isFinite(numero)
            ? `${numero.toFixed(2).replace('.', ',')}%`
            : '-';
    };

    const concluidos = simulados.filter(s =>
        s.percentual !== null &&
        s.percentual !== undefined &&
        s.percentual !== '' &&
        Number.isFinite(Number(s.percentual))
    );

    const media = concluidos.length
        ? concluidos.reduce((soma, s) => soma + Number(s.percentual), 0) / concluidos.length
        : null;

    const melhor = concluidos.length
        ? Math.max(...concluidos.map(s => Number(s.percentual)))
        : null;

    return (
        <main className="container historico-page">
            <button className="historico-voltar" onClick={onVoltar}>
                ← Voltar ao Dashboard
            </button>

            <header className="historico-header">
                <span>SEU DESEMPENHO</span>
                <h1>Histórico de Simulados</h1>
                <p>Acompanhe seus resultados e sua evolução na preparação para o ENADE.</p>
            </header>

            {carregando && <p>Carregando histórico...</p>}
            {erro && <div className="alert alert-danger">{erro}</div>}

            {!carregando && !erro && simulados.length === 0 && (
                <div className="historico-vazio">
                    <h3>Nenhum simulado realizado</h3>
                    <p>Comece a estudar para visualizar seus resultados aqui.</p>
                    <button onClick={onVoltar}>Escolher um curso</button>
                </div>
            )}

            {!carregando && !erro && simulados.length > 0 && (
                <>
                    <section className="historico-resumo">
                        <div>
                            <span>Simulados realizados</span>
                            <strong>{simulados.length}</strong>
                        </div>
                        <div>
                            <span>Média de aproveitamento</span>
                            <strong>{formatarNota(media)}</strong>
                        </div>
                        <div>
                            <span>Melhor resultado</span>
                            <strong>{formatarNota(melhor)}</strong>
                        </div>
                    </section>

                    <section className="historico-lista">
                        <h2>Resultados anteriores</h2>

                        <div className="table-responsive">
                            <table className="historico-tabela">
                                <thead>
                                    <tr>
                                        <th>Simulado</th>
                                        <th>Data</th>
                                        <th>Acertos</th>
                                        <th>Erros</th>
                                        <th>Nota</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {simulados.map(simulado => (
                                        <tr key={simulado.id}>
                                            <td>#{simulado.id}</td>
                                            <td>{formatarData(simulado.data_realizacao)}</td>
                                            <td>{simulado.acertos ?? '-'}</td>
                                            <td>{simulado.erros ?? '-'}</td>
                                            <td>
                                                <span className="historico-nota">
                                                    {formatarNota(simulado.percentual)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </>
            )}
        </main>
    );
}

export default Historico;
