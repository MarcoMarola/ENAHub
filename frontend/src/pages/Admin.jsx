
import { useEffect, useState } from 'react';
import './Admin.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const formularioInicial = {
    enunciado: '',
    alternativa_a: '',
    alternativa_b: '',
    alternativa_c: '',
    alternativa_d: '',
    alternativa_e: '',
    resposta_correta: 'A',
    curso_id: ''
};

function Admin({ onSair }) {
    const [questoes, setQuestoes] = useState([]);
    const [cursos, setCursos] = useState([]);
    const [formulario, setFormulario] = useState(formularioInicial);
    const [questaoEditando, setQuestaoEditando] = useState(null);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [excluindo, setExcluindo] = useState(null);
    const [mensagem, setMensagem] = useState('');
    const [erro, setErro] = useState('');

    const token = sessionStorage.getItem('token');

    const carregarQuestoes = async () => {
        const resposta = await fetch(`${API_URL}/questoes/admin`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.mensagem || 'Erro ao carregar questões.');
        }

        setQuestoes(dados);
    };

    useEffect(() => {
        const carregarDados = async () => {
            try {
                const respostaCursos = await fetch(`${API_URL}/cursos`);
                const dadosCursos = await respostaCursos.json();

                if (!respostaCursos.ok) {
                    throw new Error(
                        dadosCursos.mensagem || 'Erro ao carregar cursos.'
                    );
                }

                setCursos(
                    Array.isArray(dadosCursos) ? dadosCursos : []
                );

                await carregarQuestoes();
            } catch (erro) {
                setErro(erro.message);
            } finally {
                setCarregando(false);
            }
        };

        carregarDados();
    }, []);

    const alterarCampo = (evento) => {
        const { name, value } = evento.target;

        setFormulario((anterior) => ({
            ...anterior,
            [name]: value
        }));
    };

    const novaQuestao = () => {
        setFormulario({ ...formularioInicial });
        setQuestaoEditando(null);
        setMostrarFormulario(true);
        setMensagem('');
        setErro('');
    };

    const editarQuestao = (questao) => {
        setFormulario({
            enunciado: questao.enunciado,
            alternativa_a: questao.alternativa_a,
            alternativa_b: questao.alternativa_b,
            alternativa_c: questao.alternativa_c,
            alternativa_d: questao.alternativa_d,
            alternativa_e: questao.alternativa_e,
            resposta_correta: questao.resposta_correta,
            curso_id: String(questao.curso_id)
        });

        setQuestaoEditando(questao.id);
        setMostrarFormulario(true);
        setMensagem('');
        setErro('');
    };

    const cancelarFormulario = () => {
        setMostrarFormulario(false);
        setQuestaoEditando(null);
        setFormulario({ ...formularioInicial });
        setErro('');
    };

    const salvarQuestao = async (evento) => {
        evento.preventDefault();
        setSalvando(true);
        setMensagem('');
        setErro('');

        try {
            const editando = questaoEditando !== null;

            const url = editando
                ? `${API_URL}/questoes/${questaoEditando}`
                : `${API_URL}/questoes`;

            const resposta = await fetch(url, {
                method: editando ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formulario,
                    curso_id: Number(formulario.curso_id)
                })
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados.mensagem || 'Erro ao salvar questão.'
                );
            }

            await carregarQuestoes();

            setMostrarFormulario(false);
            setQuestaoEditando(null);
            setFormulario({ ...formularioInicial });
            setMensagem(dados.mensagem);
        } catch (erro) {
            setErro(erro.message);
        } finally {
            setSalvando(false);
        }
    };

    const excluirQuestao = async (id) => {
        const confirmado = window.confirm(
            'Tem certeza que deseja excluir esta questão?'
        );

        if (!confirmado) {
            return;
        }

        setExcluindo(id);
        setMensagem('');
        setErro('');

        try {
            const resposta = await fetch(`${API_URL}/questoes/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados.mensagem || 'Erro ao excluir questão.'
                );
            }

            await carregarQuestoes();
            setMensagem(dados.mensagem);
        } catch (erro) {
            setErro(erro.message);
        } finally {
            setExcluindo(null);
        }
    };

    return (
        <div className="admin-page">
            <header className="admin-nav">
                <div className="container admin-nav-conteudo">
                    <div className="admin-marca">
                        <div className="admin-logo">E</div>
                        <h1>ENAHub</h1>
                    </div>

                    <div className="admin-menu">
                        <button type="button" onClick={onSair}>
                            Sair
                        </button>
                    </div>
                </div>
            </header>

            <main className="container">
                <section className="admin-boas-vindas">
                    <span>ÁREA ADMINISTRATIVA</span>
                    <h2>Painel Administrativo</h2>
                    <p>
                        Gerencie as questões utilizadas nos simulados
                        e mantenha o banco de questões atualizado.
                    </p>
                </section>

                {mensagem && (
                    <div className="admin-mensagem admin-mensagem-sucesso">
                        {mensagem}
                    </div>
                )}

                {erro && (
                    <div className="admin-mensagem admin-mensagem-erro">
                        {erro}
                    </div>
                )}

                {carregando ? (
                    <div className="admin-vazio">
                        <p>Carregando painel administrativo...</p>
                    </div>
                ) : !mostrarFormulario ? (
                    <>
                        <div className="admin-secao-cabecalho">
                            <div>
                                <h2 className="admin-titulo">
                                    Questões cadastradas ({questoes.length})
                                </h2>
                                <p className="admin-subtitulo">
                                    Cadastre, edite e gerencie as questões.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="admin-botao-primario"
                                onClick={novaQuestao}
                            >
                                + Nova questão
                            </button>
                        </div>

                        {questoes.length === 0 ? (
                            <div className="admin-vazio">
                                <p>Nenhuma questão cadastrada.</p>
                            </div>
                        ) : (
                            questoes.map((questao) => (
                                <div className="admin-card" key={questao.id}>
                                    <h3>Questão #{questao.id}</h3>

                                    <p>{questao.enunciado}</p>

                                    <div>
                                        <span className="admin-etiqueta">
                                            Curso {questao.curso_id}
                                        </span>

                                        <span className="admin-etiqueta admin-etiqueta-resposta">
                                            Resposta: {questao.resposta_correta}
                                        </span>
                                    </div>

                                    <div className="admin-card-acoes">
                                        <button
                                            type="button"
                                            className="admin-botao-secundario"
                                            onClick={() => editarQuestao(questao)}
                                        >
                                            Editar
                                        </button>

                                        <button
                                            type="button"
                                            className="admin-botao-perigo"
                                            disabled={excluindo !== null}
                                            onClick={() => excluirQuestao(questao.id)}
                                        >
                                            {excluindo === questao.id
                                                ? 'Excluindo...'
                                                : 'Excluir'}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </>
                ) : (
                    <div className="admin-formulario">
                        <h3>
                            {questaoEditando !== null
                                ? 'Editar questão'
                                : 'Cadastrar nova questão'}
                        </h3>

                        <form onSubmit={salvarQuestao}>
                            <div className="admin-campo">
                                <label htmlFor="admin-curso">
                                    Curso
                                </label>

                                <select
                                    id="admin-curso"
                                    name="curso_id"
                                    value={formulario.curso_id}
                                    onChange={alterarCampo}
                                    required
                                >
                                    <option value="">
                                        Selecione um curso
                                    </option>

                                    {cursos.map((curso) => (
                                        <option
                                            key={curso.id}
                                            value={curso.id}
                                        >
                                            {curso.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="admin-campo">
                                <label htmlFor="admin-enunciado">
                                    Enunciado
                                </label>

                                <textarea
                                    id="admin-enunciado"
                                    name="enunciado"
                                    rows="4"
                                    value={formulario.enunciado}
                                    onChange={alterarCampo}
                                    required
                                />
                            </div>

                            {['a', 'b', 'c', 'd', 'e'].map((letra) => (
                                <div className="admin-campo" key={letra}>
                                    <label htmlFor={`admin-alternativa-${letra}`}>
                                        Alternativa {letra.toUpperCase()}
                                    </label>

                                    <input
                                        id={`admin-alternativa-${letra}`}
                                        name={`alternativa_${letra}`}
                                        value={formulario[`alternativa_${letra}`]}
                                        onChange={alterarCampo}
                                        maxLength={255}
                                        required
                                    />
                                </div>
                            ))}

                            <div className="admin-campo">
                                <label htmlFor="admin-resposta">
                                    Resposta correta
                                </label>

                                <select
                                    id="admin-resposta"
                                    name="resposta_correta"
                                    value={formulario.resposta_correta}
                                    onChange={alterarCampo}
                                >
                                    {['A', 'B', 'C', 'D', 'E'].map((letra) => (
                                        <option key={letra} value={letra}>
                                            Alternativa {letra}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="admin-formulario-acoes">
                                <button
                                    type="submit"
                                    className="admin-botao-primario"
                                    disabled={salvando}
                                >
                                    {salvando
                                        ? 'Salvando...'
                                        : 'Salvar questão'}
                                </button>

                                <button
                                    type="button"
                                    className="admin-botao-secundario"
                                    onClick={cancelarFormulario}
                                    disabled={salvando}
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Admin;
