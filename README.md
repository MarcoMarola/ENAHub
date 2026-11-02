# ENAHub — Plataforma de Preparação para o ENADE

O **ENAHub** é uma plataforma web desenvolvida para auxiliar estudantes universitários na preparação para o Exame Nacional de Desempenho dos Estudantes (ENADE).

A aplicação permite que os usuários criem contas, acessem questões organizadas por curso, realizem simulados, recebam correções automáticas e acompanhem seu histórico de desempenho.

## Tecnologias utilizadas

### Frontend
- React
- JavaScript
- Vite
- HTML e CSS
- Bootstrap

### Backend
- Node.js
- Express
- API REST

### Banco de dados
- MySQL

### Segurança
- JWT — autenticação de usuários
- bcrypt — proteção de senhas por hash
- Helmet — configuração de cabeçalhos HTTP de segurança
- Express Validator — validação de dados recebidos pela API

### Hospedagem
- **Vercel:** frontend
- **Render:** backend
- **Aiven:** banco de dados MySQL

## Funcionalidades

- Cadastro de usuários
- Login com autenticação JWT
- Visualização dos cursos disponíveis
- Realização de simulados
- Correção automática das respostas
- Exibição de acertos, erros e percentual de desempenho
- Histórico de simulados realizados
- Consulta e atualização de perfil
- Exclusão de conta

## Operações CRUD

O ENAHub implementa as quatro operações fundamentais de gerenciamento de dados:

| Operação | Funcionalidade |
|---|---|
| CREATE | Cadastro de usuários e criação de simulados |
| READ | Consulta de perfil, cursos, questões e histórico |
| UPDATE | Atualização dos dados do perfil |
| DELETE | Exclusão da conta do usuário |

As operações são realizadas por meio da interface web, que se comunica com a API REST do backend.

## Arquitetura da aplicação

O projeto utiliza uma arquitetura cliente-servidor, separando a interface, a lógica de negócio e o armazenamento dos dados.

O fluxo de comunicação é:

**Usuário → Frontend (React/Vercel) → API REST (Node.js/Render) → Banco MySQL (Aiven)**

O backend organiza suas responsabilidades em rotas, controllers e middlewares.

## Banco de dados

O banco de dados `enahub` possui cinco tabelas principais:

| Tabela | Responsabilidade |
|---|---|
| usuarios | Armazenamento das contas dos estudantes |
| cursos | Cadastro dos cursos disponíveis |
| questoes | Questões de múltipla escolha |
| simulados | Registro dos simulados realizados |
| respostas | Armazenamento das respostas dos usuários |

O banco utiliza chaves estrangeiras para garantir a integridade referencial.

As relações entre usuários e simulados, e entre simulados e respostas, utilizam `ON DELETE CASCADE`, permitindo que a exclusão de uma conta também remova seus registros dependentes.

## Estrutura do projeto

```text
ENAHub/
├── backend/
├── frontend/
├── database/
└── README.md
```

## Execução local

### Pré-requisitos

- Node.js e npm
- MySQL
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

Crie um arquivo `.env` dentro da pasta `backend` e configure as variáveis de ambiente necessárias para o banco de dados e a autenticação.

Exemplo:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=enahub
DB_SSL=false
JWT_SECRET=sua_chave_secreta
FRONTEND_URL=http://localhost:5173
```

Inicie o servidor:

```bash
npm start
```

### 3. Configurar o frontend

Em outro terminal:

```bash
cd frontend
npm install
```

Crie o arquivo `.env` no frontend com:

```env
VITE_API_URL=http://localhost:3000
```

Inicie a aplicação:

```bash
npm run dev
```

Acesse o endereço local informado pelo Vite, normalmente `http://localhost:5173`.

**Observação:** o banco de dados deve estar criado e conter as tabelas necessárias antes da execução. Nunca publique senhas, certificados ou chaves JWT reais no repositório.

## Deploy

O ENAHub está hospedado em três serviços:

| Componente | Plataforma |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Banco MySQL | Aiven |

### Links da aplicação

**Frontend:** https://ena-hub.vercel.app/

**Backend:** https://enahub-backend.onrender.com/

**Repositório:** https://github.com/MarcoMarola/ENAHub

## Objetivo acadêmico

O projeto foi desenvolvido como atividade acadêmica da disciplina de Desenvolvimento Web, com o objetivo de aplicar conhecimentos de desenvolvimento frontend, backend, banco de dados, autenticação, segurança e integração de sistemas.

## Equipe

O desenvolvimento foi organizado entre quatro responsabilidades:

- Desenvolvimento Frontend
- Desenvolvimento Backend
- Design UX/UI
- Gerenciamento de Projeto

## Considerações finais

O ENAHub integra tecnologias de desenvolvimento web em uma aplicação funcional, permitindo que estudantes pratiquem questões e acompanhem seu desempenho em simulados.

O projeto demonstra a integração entre interface web, API REST, autenticação e banco de dados hospedado na nuvem.
