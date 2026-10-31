
import { useEffect, useState } from 'react';

function Questoes({ curso, onVoltar }) {
    const [questoes, setQuestoes] = useState([]);
    const [respostas, setRespostas] = useState({});
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');

    const [finalizando, setFinalizando] = useState(false);
    const [resultado, setResultado] = useState(null);
    const [erroFinalizacao, setErroFinalizacao] = useState('');

    // Carregar questões do curso
    useEffect(() => {
        const carregarQuestoes = async () => {
            setCarregando(true);
            setErro('');
            setRespostas({});
            setResultado(null);
            setErroFinalizacao('');

            try {
                const resposta = await fetch(
                    `http://localhost:3000/questoes?curso_id=${curso.id}`
                );

                if (!resposta.ok) {
                    throw new Error('Erro ao buscar questões.');
                }

                const dados = await resposta.json();
                setQuestoes(dados);

            } catch (erro) {
                console.error('Erro ao carregar questões:', erro);
                setErro('Não foi possível carregar as questões.');
            } finally {
                setCarregando(false);
            }
        };

        carregarQuestoes();
    }, [curso.id]);

    // Selecionar alternativa
    const selecionarResposta = (questaoId, alternativa) => {
        if (resultado || finalizando) return;

        setRespostas((anteriores) => ({
            ...anteriores,
            [questaoId]: alternativa
        }));
    };

    // Finalizar e corrigir simulado
    const finalizarSimulado = async () => {
        if (Object.keys(respostas).length !== questoes.length) {
            setErroFinalizacao(
                'Responda todas as questões antes de finalizar.'
            );
            return;
        }

        setFinalizando(true);
        setErroFinalizacao('');

        try {
            const token = sessionStorage.getItem('token');

            if (!token) {
                throw new Error(
                    'Sessão expirada. Faça login novamente.'
                );
            }

            const headers = {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            };

            // Criar simulado no backend
            const respostaCriacao = await fetch(
                'http://localhost:3000/simulados',
                {
                    method: 'POST',
                    headers
                }
            );

            const dadosCriacao = await respostaCriacao.json();

            if (!respostaCriacao.ok) {
                throw new Error(
                    dadosCriacao.mensagem ||
                    'Erro ao criar simulado.'
                );
            }

            const simuladoId =
                dadosCriacao.id ?? dadosCriacao.simulado?.id;

            if (!simuladoId) {
                throw new Error(
                    'O servidor não retornou o ID do simulado.'
                );
            }

            // Organizar respostas para envio
            const respostasEnviadas = questoes.map((questao) => ({
                questao_id: questao.id,
                resposta: respostas[questao.id]
            }));

            // Enviar respostas para correção
            const respostaCorrecao = await fetch(
                `http://localhost:3000/simulados/${simuladoId}/respostas`,
                {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        respostas: respostasEnviadas
                    })
                }
            );

            const dadosCorrecao = await respostaCorrecao.json();

            if (!respostaCorrecao.ok) {
                throw new Error(
                    dadosCorrecao.mensagem ||
                    'Erro ao corrigir simulado.'
                );
            }

            setResultado(dadosCorrecao.resultado);
            console.log('RESULTADO DO BACKEND:', dadosCorrecao);

        } catch (erro) {
            console.error('Erro ao finalizar simulado:', erro);
            setErroFinalizacao(erro.message);
        } finally {
            setFinalizando(false);
        }
    };

    return (
        <div className="container py-4">
            <button
                className="btn btn-outline-secondary mb-4"
                onClick={onVoltar}
                disabled={finalizando}
            >
                Voltar aos cursos
            </button>

            <h1>Questões — {curso.nome}</h1>

            <p className="text-muted">
                Prepare-se para o ENADE respondendo às questões.
            </p>

            {carregando && (
                <p>Carregando questões...</p>
            )}

            {erro && (
                <div className="alert alert-danger">
                    {erro}
                </div>
            )}

            {!carregando && !erro && questoes.length === 0 && (
                <div className="alert alert-info">
                    Ainda não existem questões cadastradas para este curso.
                </div>
            )}

            {!carregando && !erro && questoes.length > 0 && (
                <>
                    <p>
                        <strong>Questões respondidas:</strong>{' '}
                        {Object.keys(respostas).length} de {questoes.length}
                    </p>

                    {questoes.map((questao, indice) => (
                        <div
                            className="card mb-3 shadow-sm"
                            key={questao.id}
                        >
                            <div className="card-body">
                                <h5 className="card-title">
                                    Questão {indice + 1}
                                </h5>

                                <p className="card-text">
                                    {questao.enunciado}
                                </p>

                                {['a', 'b', 'c', 'd', 'e'].map((letra) => {
                                    const alternativa = letra.toUpperCase();

                                    return (
                                        <div
                                            className="form-check mb-2"
                                            key={letra}
                                        >
                                            <input
                                                type="radio"
                                                id={`questao-${questao.id}-${letra}`}
                                                name={`questao-${questao.id}`}
                                                className="form-check-input"
                                                value={alternativa}
                                                checked={
                                                    respostas[questao.id] === alternativa
                                                }
                                                onChange={() =>
                                                    selecionarResposta(
                                                        questao.id,
                                                        alternativa
                                                    )
                                                }
                                                disabled={
                                                    !!resultado || finalizando
                                                }
                                            />

                                            <label
                                                className="form-check-label"
                                                htmlFor={`questao-${questao.id}-${letra}`}
                                            >
                                                {alternativa}){' '}
                                                {questao[`alternativa_${letra}`]}
                                            </label>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {erroFinalizacao && (
                        <div className="alert alert-danger">
                            {erroFinalizacao}
                        </div>
                    )}

                    {resultado ? (
                        <div className="alert alert-success">
                            <h4>Simulado finalizado!</h4>

                            <p>
                                <strong>Acertos:</strong>{' '}
                                {resultado.acertos}
                            </p>

                            <p>
                                <strong>Erros:</strong>{' '}
                                {resultado.erros}
                            </p>

                            <p>
                                <strong>Nota:</strong>{' '}
                                {resultado.percentual}%
                            </p>

                            <button
                                className="btn btn-primary mt-2"
                                onClick={onVoltar}
                            >
                                Voltar aos cursos
                            </button>
                        </div>
                    ) : (
                        <button
                            className="btn btn-success mb-4"
                            onClick={finalizarSimulado}
                            disabled={finalizando}
                        >
                            {finalizando
                                ? 'Corrigindo...'
                                : 'Finalizar simulado'}
                        </button>
                    )}
                </>
            )}
        </div>
    );
}

export default Questoes;
