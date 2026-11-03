# ENAHub — Plataforma de Preparação para o ENADE

O **ENAHub** é uma plataforma web desenvolvida com o objetivo de auxiliar estudantes universitários na preparação para o Exame Nacional de Desempenho dos Estudantes (ENADE).

A aplicação oferece um ambiente de estudos com simulados organizados por curso, correção automática, acompanhamento de resultados e gerenciamento de questões por administradores.

O projeto foi desenvolvido como trabalho acadêmico da disciplina de Desenvolvimento Web.

## Funcionalidades

### Autenticação e usuários
- Cadastro de usuários.
- Login com autenticação JWT.
- Criptografia de senhas utilizando Bcrypt.
- Gerenciamento de perfil.
- Recuperação da sessão enquanto o token estiver válido.
- Controle de acesso baseado no perfil do usuário.

### Simulados
- Seleção de questões por curso.
- Realização de simulados.
- Correção automática das respostas.
- Cálculo de acertos, erros e percentual de desempenho.
- Armazenamento dos resultados no banco de dados.
- Consulta ao histórico de simulados realizados.

### Painel administrativo
- Acesso restrito a administradores.
- Listagem das questões cadastradas.
- Cadastro de novas questões.
- Edição de questões existentes.
- Exclusão de questões.
- Associação das questões aos cursos.
- Definição da alternativa correta.

**Integridade dos dados:** questões que já possuem respostas registradas não podem ser editadas ou excluídas, preservando a consistência do histórico dos estudantes.

## Tecnologias utilizadas

### Frontend
- React
- Vite
- JavaScript
- HTML5
- CSS3
- Bootstrap

### Backend
- Node.js
- Express
- MySQL2
- JSON Web Token (JWT)
- Bcrypt
- Helmet
- Express-Validator
- Dotenv
- CORS

### Banco de dados
- MySQL
- MySQL Workbench para gerenciamento local
- Aiven para hospedagem do banco de produção

### Hospedagem
- **Frontend:** Vercel
- **Backend:** Render
- **Banco de dados:** Aiven
- **Versionamento:** Git e GitHub

## Arquitetura do projeto

O ENAHub utiliza uma arquitetura cliente-servidor, com separação entre frontend, backend e banco de dados.

O frontend é responsável pela interface e interação com os usuários, enquanto o backend disponibiliza uma API REST para processar as requisições, aplicar regras de negócio e acessar o banco de dados.

A comunicação entre frontend e backend ocorre por meio de requisições HTTP, utilizando JSON para troca de informações.

### Organização dos diretórios

```text
ENAHub/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   └── database.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .env
├── .gitignore
└── README.md
```

Os arquivos `.env` são utilizados localmente e não devem ser enviados ao repositório.

## Banco de dados

O sistema utiliza o MySQL para armazenar informações relacionadas aos usuários, cursos, questões, simulados e respostas.

As principais tabelas são:

| Tabela | Finalidade |
|---|---|
| `usuarios` | Dados dos usuários e seus perfis de acesso |
| `cursos` | Cursos disponíveis na plataforma |
| `questoes` | Enunciados, alternativas e respostas corretas |
| `simulados` | Registros dos simulados realizados |
| `respostas` | Respostas fornecidas pelos estudantes |

O banco de produção está hospedado na Aiven.

## Segurança

O ENAHub implementa mecanismos de segurança para proteger o acesso e os dados da aplicação.

- **JWT:** autenticação de requisições protegidas.
- **Bcrypt:** armazenamento seguro de hashes de senhas.
- **Helmet:** configuração de cabeçalhos HTTP de segurança.
- **Express-Validator:** validação de dados recebidos nas rotas.
- **Middleware de autenticação:** verificação dos tokens enviados.
- **Middleware administrativo:** restrição de operações administrativas a usuários autorizados.
- **Variáveis de ambiente:** separação de configurações sensíveis do código-fonte.

O perfil administrativo não pode ser escolhido livremente durante o cadastro público.

## Instalação e execução local

### Pré-requisitos

- Node.js e npm
- MySQL Server
- Git

### 1. Clonar o repositório

```bash
git clone https://github.com/MarcoMarola/ENAHub.git
cd ENAHub
```

### 2. Configurar o backend

```bash
cd backend
npm install
```

Crie um arquivo `.env` na pasta `backend` com as configurações adequadas ao ambiente:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=enahub
JWT_SECRET=sua_chave_secreta
PORT=3000
```

Os nomes e valores das variáveis devem corresponder à configuração utilizada pelo backend.

É necessário criar o banco de dados e suas tabelas antes de executar a aplicação.

### 3. Iniciar o backend

```bash
npm run dev
```

Por padrão, o backend local utiliza a porta 3000.

### 4. Configurar o frontend

Em outro terminal:

```bash
cd frontend
npm install
```

Para configurar o endereço da API, utilize a variável `VITE_API_URL` no ambiente do frontend:

```env
VITE_API_URL=http://localhost:3000
```

### 5. Iniciar o frontend

```bash
npm run dev
```

Acesse o endereço local informado pelo Vite, normalmente:

http://localhost:5173

## Principais endpoints da API

### Usuários

| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/usuarios` | Cadastrar usuário |
| POST | `/usuarios/login` | Autenticar usuário |
| GET | `/usuarios/me` | Recuperar dados da sessão |
| PUT | `/usuarios/:id` | Atualizar usuário |
| DELETE | `/usuarios/:id` | Excluir usuário |

### Questões

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/questoes` | Listar questões |
| GET | `/questoes/admin` | Listar questões para administradores |
| POST | `/questoes` | Cadastrar questão |
| PUT | `/questoes/:id` | Atualizar questão |
| DELETE | `/questoes/:id` | Excluir questão |

As operações administrativas exigem autenticação e autorização.

## Aplicação publicada

**Frontend — Vercel**

https://ena-hub.vercel.app/

**Backend — Render**

https://enahub-backend.onrender.com/

**Repositório — GitHub**

https://github.com/MarcoMarola/ENAHub

## Testes realizados

Durante o desenvolvimento, foram realizados testes funcionais para verificar:

- Cadastro e autenticação de usuários.
- Comunicação entre frontend e backend.
- Conexão com o MySQL.
- Criação e correção de simulados.
- Armazenamento e consulta de resultados.
- Gerenciamento de perfil.
- Restrição de acesso às rotas administrativas.
- Cadastro, listagem, edição e exclusão de questões.
- Bloqueio de alterações em questões já respondidas.
- Funcionamento do painel administrativo em produção.

## Equipe

Projeto desenvolvido para a disciplina de Desenvolvimento Web.

**Integrantes:**
- [Marco Cauã Andrade Marques]
- [Pedro Pompeu]
- [Cauã Melo]
- [João Victor]


## Considerações finais

O ENAHub reúne funcionalidades de autenticação, gerenciamento de usuários, simulados e administração de questões em uma aplicação web integrada.

O desenvolvimento permitiu aplicar conhecimentos de frontend, backend, APIs REST, banco de dados relacional, autenticação, segurança e implantação de aplicações em serviços de nuvem.

A plataforma oferece aos estudantes um ambiente para praticar questões e acompanhar seu desempenho na preparação para o ENADE.
