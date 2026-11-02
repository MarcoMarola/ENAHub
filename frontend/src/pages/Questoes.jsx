
import { useEffect, useState } from 'react';
import './Questoes.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function Questoes({ curso, onVoltar }) {
    const [questoes, setQuestoes] = useState([]);
    const [respostas, setRespostas] = useState({});
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [finalizando, setFinalizando] = useState(false);
    const [resultado, setResultado] = useState(null);

    useEffect(() => {
        setCarregando(true);
        setErro('');
        setRespostas({});
        setResultado(null);

        fetch(`${API_URL}/questoes?curso_id=${curso.id}`)
            .then(res => {
                if (!res.ok) throw new Error('Erro ao carregar questões.');
                return res.json();
            })
            .then(setQuestoes)
            .catch(err => setErro(err.message))
            .finally(() => setCarregando(false));
    }, [curso.id]);

    const finalizar = async () => {
        if (Object.keys(respostas).length !== questoes.length) {
            setErro('Responda todas as questões antes de finalizar.');
            return;
        }

        setFinalizando(true);
        setErro('');

        try {
            const token = sessionStorage.getItem('token');
            if (!token) throw new Error('Sessão expirada. Faça login novamente.');

            const headers = {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            };

            const criacao = await fetch(`${API_URL}/simulados`, {
                method: 'POST',
                headers
            });

            const dadosCriacao = await criacao.json();
            if (!criacao.ok) throw new Error(dadosCriacao.mensagem || 'Erro ao criar simulado.');

            const id = dadosCriacao.id ?? dadosCriacao.simulado?.id;
            if (!id) throw new Error('ID do simulado não encontrado.');

            const correcao = await fetch(`${API_URL}/simulados/${id}/respostas`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    respostas: questoes.map(q => ({
                        questao_id: q.id,
                        resposta: respostas[q.id]
                    }))
                })
            });

            const dados = await correcao.json();
            if (!correcao.ok) throw new Error(dados.mensagem || 'Erro ao corrigir simulado.');

            setResultado(dados.resultado);
        } catch (err) {
            setErro(err.message);
        } finally {
            setFinalizando(false);
        }
    };

    const respondidas = Object.keys(respostas).length;
    const progresso = questoes.length ? respondidas / questoes.length * 100 : 0;

    return (
        <main className="container questoes-page">
            <button className="questoes-voltar" onClick={onVoltar} disabled={finalizando}>
                ← Voltar aos cursos
            </button>

            <header className="questoes-header">
                <span>PREPARAÇÃO PARA O ENADE</span>
                <h1>{curso.nome}</h1>
                <p>Teste seus conhecimentos e acompanhe seu desempenho.</p>
            </header>

            {carregando && <p>Carregando questões...</p>}
            {erro && <div className="alert alert-danger">{erro}</div>}

            {!carregando && !erro && questoes.length === 0 && (
                <p>Nenhuma questão disponível para este curso.</p>
            )}

            {!carregando && questoes.length > 0 && (
                <>
                    <section className="questoes-progresso">
                        <div className="d-flex justify-content-between gap-2">
                            <strong>Progresso do simulado</strong>
                            <span>{respondidas}/{questoes.length} respondidas</span>
                        </div>
                        <div className="questoes-barra">
                            <div style={{ width: `${progresso}%` }} />
                        </div>
                    </section>

                    {questoes.map((questao, indice) => (
                        <article className="questoes-card" key={questao.id}>
                            <span className="questoes-numero">QUESTÃO {indice + 1}</span>
                            <p className="questoes-enunciado">{questao.enunciado}</p>

                            {['a', 'b', 'c', 'd', 'e'].map(letra => {
                                const alternativa = letra.toUpperCase();
                                const selecionada = respostas[questao.id] === alternativa;

                                return (
                                    <label
                                        key={letra}
                                        className={`questoes-alternativa ${selecionada ? 'selecionada' : ''}`}
                                    >
                                        <input
                                            type="radio"
                                            name={`questao-${questao.id}`}
                                            checked={selecionada}
                                            disabled={!!resultado || finalizando}
                                            onChange={() => {
                                                setRespostas(prev => ({
                                                    ...prev,
                                                    [questao.id]: alternativa
                                                }));
                                                setErro('');
                                            }}
                                        />
                                        <strong>{alternativa}</strong>
                                        <span>{questao[`alternativa_${letra}`]}</span>
                                    </label>
                                );
                            })}
                        </article>
                    ))}

                    {resultado ? (
                        <section className="questoes-resultado">
                            <h2>Simulado concluído!</h2>
                            <div className="questoes-estatisticas">
                                <div><strong>{resultado.acertos}</strong><span>Acertos</span></div>
                                <div><strong>{resultado.erros}</strong><span>Erros</span></div>
                                <div><strong>{resultado.percentual}%</strong><span>Aproveitamento</span></div>
                            </div>
                            <button onClick={onVoltar}>Voltar aos cursos</button>
                        </section>
                    ) : (
                        <div className="questoes-acoes">
                            <button onClick={finalizar} disabled={finalizando || carregando}>
                                {finalizando ? 'Corrigindo...' : 'Finalizar simulado'}
                            </button>
                        </div>
                    )}
                </>
            )}
        </main>
    );
}

export default Questoes;
