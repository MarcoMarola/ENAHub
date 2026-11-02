
import { useState } from 'react';
import './Cadastro.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
            const resposta = await fetch(`${API_URL}/usuarios`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nome, email, senha })
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(dados.mensagem || 'Erro ao cadastrar usuário.');
            }

            setSucesso(true);
            setMensagem('Cadastro realizado com sucesso! Você já pode entrar.');
            setNome('');
            setEmail('');
            setSenha('');
        } catch (erro) {
            setMensagem(erro.message);
        } finally {
            setCarregando(false);
        }
    };

    return (
        <main className="cadastro-page">
            <section className="cadastro-card">
                <div className="cadastro-logo">E</div>

                <h1>ENAHub</h1>
                <p className="cadastro-subtitulo">
                    Sua jornada de preparação para o ENADE começa aqui.
                </p>

                <div className="cadastro-divisor" />

                <h2>Criar conta</h2>
                <p className="cadastro-descricao">
                    Preencha seus dados para começar a estudar.
                </p>

                {mensagem && (
                    <div
                        className={`alert ${sucesso ? 'alert-success' : 'alert-danger'}`}
                        role="alert"
                    >
                        {mensagem}
                    </div>
                )}

                <form onSubmit={cadastrar}>
                    <div className="cadastro-campo">
                        <label htmlFor="nome">Nome completo</label>
                        <input
                            id="nome"
                            type="text"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            placeholder="Digite seu nome completo"
                            maxLength={100}
                            autoComplete="name"
                            required
                        />
                    </div>

                    <div className="cadastro-campo">
                        <label htmlFor="emailCadastro">E-mail</label>
                        <input
                            id="emailCadastro"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seuemail@exemplo.com"
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className="cadastro-campo">
                        <label htmlFor="senhaCadastro">Senha</label>
                        <input
                            id="senhaCadastro"
                            type="password"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            placeholder="Mínimo de 8 caracteres"
                            minLength={8}
                            autoComplete="new-password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="cadastro-enviar"
                        disabled={carregando}
                    >
                        {carregando ? 'Cadastrando...' : 'Criar minha conta'}
                    </button>
                </form>

                <p className="cadastro-login">
                    Já tem uma conta?{' '}
                    <button type="button" onClick={onVoltar}>
                        Entrar
                    </button>
                </p>
            </section>
        </main>
    );
}

export default Cadastro;
