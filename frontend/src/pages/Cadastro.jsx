
import { useState } from 'react';

function Cadastro({ onVoltar }) {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [sucesso, setSucesso] = useState(false);
    const [carregando, setCarregando] = useState(false);

    const cadastrar = async (evento) => {
        evento.preventDefault();

        setMensagem('');
        setSucesso(false);
        setCarregando(true);

        try {
            const resposta = await fetch(
                'http://localhost:3000/usuarios',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        nome,
                        email,
                        senha
                    })
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados.mensagem || 'Erro ao cadastrar usuário.'
                );
            }

            setSucesso(true);
            setMensagem('Cadastro realizado com sucesso!');
            setNome('');
            setEmail('');
            setSenha('');

        } catch (erro) {
            console.error('Erro no cadastro:', erro);
            setMensagem(erro.message);
        } finally {
            setCarregando(false);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-100">
            <div
                className="card shadow p-4"
                style={{ width: '450px', maxWidth: '100%' }}
            >
                <h1 className="text-center mb-2">ENAHub</h1>

                <h4 className="text-center mb-4">
                    Criar conta
                </h4>

                {mensagem && (
                    <div
                        className={
                            sucesso
                                ? 'alert alert-success'
                                : 'alert alert-danger'
                        }
                    >
                        {mensagem}
                    </div>
                )}

                <form onSubmit={cadastrar}>
                    <div className="mb-3">
                        <label htmlFor="nome" className="form-label">
                            Nome completo
                        </label>
                        <input
                            id="nome"
                            type="text"
                            className="form-control"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="emailCadastro" className="form-label">
                            E-mail
                        </label>
                        <input
                            id="emailCadastro"
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="senhaCadastro" className="form-label">
                            Senha
                        </label>
                        <input
                            id="senhaCadastro"
                            type="password"
                            className="form-control"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            minLength={8}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={carregando}
                    >
                        {carregando ? 'Cadastrando...' : 'Criar conta'}
                    </button>
                </form>

                <button
                    type="button"
                    className="btn btn-link mt-3"
                    onClick={onVoltar}
                >
                    Já tenho uma conta
                </button>
            </div>
        </div>
    );
}

export default Cadastro;
