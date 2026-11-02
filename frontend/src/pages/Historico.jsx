
import { useEffect, useState } from 'react';

function Historico({ onVoltar }) {
    const [simulados, setSimulados] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    useEffect(() => {
        const carregarHistorico = async () => {
            try {
                const token = sessionStorage.getItem('token');

                if (!token) {
                    throw new Error('Sessão não encontrada.');
                }

                const resposta = await fetch(
                    'http://localhost:3000/simulados',
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (!resposta.ok) {
                    throw new Error('Erro ao carregar histórico.');
                }

                const dados = await resposta.json();
                setSimulados(dados);

            } catch (erro) {
                console.error('Erro no histórico:', erro);
                setErro('Não foi possível carregar o histórico.');
            } finally {
                setCarregando(false);
            }
        };

        carregarHistorico();
    }, []);

    return (
        <div className="container py-4">
            <button
                className="btn btn-outline-secondary mb-4"
                onClick={onVoltar}
            >
                Voltar ao Dashboard
            </button>

            <h1>Histórico de Simulados</h1>

            <p className="text-muted">
                Confira seus resultados anteriores.
            </p>

            {carregando && (
                <p>Carregando histórico...</p>
            )}

            {erro && (
                <div className="alert alert-danger">
                    {erro}
                </div>
            )}

            {!carregando && !erro && simulados.length === 0 && (
                <div className="alert alert-info">
                    Você ainda não realizou nenhum simulado.
                </div>
            )}

            {!carregando && !erro && simulados.length > 0 && (
                <div className="table-responsive">
                    <table className="table table-striped table-bordered">
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
                            {simulados.map((simulado) => (
                                <tr key={simulado.id}>
                                    <td>#{simulado.id}</td>
                                    <td>
                                        {new Date(
                                            simulado.data_realizacao
                                        ).toLocaleString('pt-BR')}
                                    </td>
                                    <td>{simulado.acertos}</td>
                                    <td>{simulado.erros}</td>
                                    <td>{simulado.percentual}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default Historico;
