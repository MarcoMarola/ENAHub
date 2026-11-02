
import { useEffect, useState } from 'react';
import './Perfil.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function Perfil({ usuario, onAtualizar, onExcluir, onVoltar }) {
    const [nome, setNome] = useState(usuario?.nome || '');
    const [email, setEmail] = useState(usuario?.email || '');
    const [mensagem, setMensagem] = useState('');
    const [erro, setErro] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [excluindo, setExcluindo] = useState(false);

    const token = sessionStorage.getItem('token');

    useEffect(() => {
        const carregarPerfil = async () => {
            try {
                const resposta = await fetch(`${API_URL}/usuarios`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!resposta.ok) {
                    throw new Error('Não foi possível carregar o perfil.');
                }

                const dados = await resposta.json();
                const perfil = dados.usuarios?.[0];

                if (perfil) {
                    setNome(perfil.nome);
                    setEmail(perfil.email);
                }
            } catch (err) {
                setErro(err.message);
            }
        };

        carregarPerfil();
    }, [token]);

    const salvar = async (evento) => {
        evento.preventDefault();
        setMensagem('');
        setErro('');
        setCarregando(true);

        try {
            const resposta = await fetch(`${API_URL}/usuarios/${usuario.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ nome })
            });

            const dados = await resposta.json();
            if (!resposta.ok) throw new Error(dados.mensagem || 'Erro ao atualizar perfil.');

            const nomeAtualizado = nome.trim();
            setNome(nomeAtualizado);
            onAtualizar({ nome: nomeAtualizado });
            setMensagem('Perfil atualizado com sucesso!');
        } catch (err) {
            setErro(err.message);
        } finally {
            setCarregando(false);
        }
    };

    const excluir = async () => {
        const confirmou = window.confirm(
            'Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.'
        );

        if (!confirmou) return;

        setMensagem('');
        setErro('');
        setExcluindo(true);

        try {
            const resposta = await fetch(`${API_URL}/usuarios/${usuario.id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            const dados = await resposta.json();
            if (!resposta.ok) throw new Error(dados.mensagem || 'Erro ao excluir conta.');

            onExcluir();
        } catch (err) {
            setErro(err.message);
        } finally {
            setExcluindo(false);
        }
    };

    return (
        <main className="container perfil-page">
            <button className="perfil-voltar" onClick={onVoltar}>
                ← Voltar ao Dashboard
            </button>

            <header className="perfil-header">
                <span>CONFIGURAÇÕES DA CONTA</span>
                <h1>Meu Perfil</h1>
                <p>Consulte e gerencie suas informações pessoais.</p>
            </header>

            <section className="perfil-card">
                <div className="perfil-identidade">
                    <div className="perfil-avatar">
                        {nome.trim().charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                        <h2>{nome || 'Usuário'}</h2>
                        <p>{email}</p>
                    </div>
                </div>

                <h3>Informações pessoais</h3>
                <p>Atualize os dados da sua conta.</p>

                {mensagem && <div className="alert alert-success">{mensagem}</div>}
                {erro && <div className="alert alert-danger">{erro}</div>}

                <form onSubmit={salvar}>
                    <div className="perfil-campo">
                        <label htmlFor="nome">Nome completo</label>
                        <input
                            id="nome"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            maxLength={100}
                            required
                        />
                    </div>

                    <div className="perfil-campo">
                        <label htmlFor="email">E-mail</label>
                        <input id="email" type="email" value={email} disabled />
                        <small>O e-mail não pode ser alterado nesta versão.</small>
                    </div>

                    <button type="submit" disabled={carregando || excluindo}>
                        {carregando ? 'Salvando...' : 'Salvar alterações'}
                    </button>
                </form>
            </section>

            <section className="perfil-perigo">
                <h3>Excluir conta</h3>
                <p>
                    Esta ação é permanente. Contas com simulados vinculados
                    podem não ser excluídas.
                </p>
                <button
                    type="button"
                    onClick={excluir}
                    disabled={carregando || excluindo}
                >
                    {excluindo ? 'Excluindo...' : 'Excluir minha conta'}
                </button>
            </section>
        </main>
    );
}

export default Perfil;
