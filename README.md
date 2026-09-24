# JJCAC - Jiu-Jitsu para Todos

> Sistema de gestao de presencas e controle de aulas desenvolvido para o projeto de extensao universitaria de Jiu-Jitsu da **UFPE (Universidade Federal de Pernambuco)**.

O JJCAC e um aplicativo web progressivo (PWA) projetado para uso direto no tatame. Utiliza QR Codes com assinatura criptografica para registro de presenca, possui suporte completo a operacao offline e implementa controle de acesso baseado em papeis (RBAC).

---

## Sumario

1. [Recursos Principais](#recursos-principais)
2. [Stack Tecnologica](#stack-tecnologica)
3. [Pre-requisitos](#pre-requisitos)
4. [Instalacao e Configuracao](#instalacao-e-configuracao)
5. [Execucao Local](#execucao-local)
6. [Execucao via Docker](#execucao-via-docker)
7. [Estrutura do Banco de Dados](#estrutura-do-banco-de-dados)
8. [Documentacao Complementar](#documentacao-complementar)

---

## Recursos Principais

- **PWA Integrado:** Instalavel em dispositivos moveis, funcionando como aplicativo nativo com suporte a notificacoes push.
- **Check-in via QR Code Criptografado:** Geracao dinamica de QR Codes assinados com HMAC-SHA256, impedindo registros de presenca fraudulentos fora do ambiente do tatame. O token e rotativo e possui validade temporal.
- **Validacao de Higiene Obrigatoria:** Antes de confirmar a presenca, o aluno deve atestar o cumprimento do protocolo de higiene pessoal exigido para a pratica.
- **Operacao Offline (IndexedDB):** Em caso de indisponibilidade de conexao no local de treino, os registros de presenca sao armazenados localmente via IndexedDB e sincronizados automaticamente com o servidor assim que a conexao e restabelecida.
- **Controle de Acesso (RBAC):** O sistema opera com tres niveis de permissao — Aluno, Monitor e Administrador — cada um com paineis e funcionalidades especificas.
- **Seguranca em Camadas:** Politicas de Row Level Security (RLS) aplicadas em todas as tabelas do banco de dados, cabecalhos HTTP de seguranca (CSP, HSTS, X-Frame-Options), validacao server-side e protecao contra ataques de forca bruta.

---

## Stack Tecnologica

| Camada | Tecnologia |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) + TypeScript |
| Estilizacao | CSS Vanilla com design responsivo e suporte a modo escuro |
| Banco de Dados e Autenticacao | [Supabase](https://supabase.com/) (PostgreSQL + GoTrue Auth) |
| Sincronizacao Offline | IndexedDB nativo (via wrapper `idb`) |
| Seguranca de QR Code | Assinatura HMAC-SHA256 com tokens rotativos |
| Containerizacao | Docker + Docker Compose |

---

## Pre-requisitos

- [Node.js 22+](https://nodejs.org/)
- [Docker](https://www.docker.com/) (opcional, para execucao via container)
- Conta no [Supabase](https://supabase.com/) com um projeto criado

---

## Instalacao e Configuracao

1. Clone o repositorio:
   ```bash
   git clone https://github.com/kirouskira2/JIUJITSUCAC_PROJETOEXTENSAO_UFPE.git
   cd JIUJITSUCAC_PROJETOEXTENSAO_UFPE
   ```

2. Copie o arquivo de variaveis de ambiente e preencha com as credenciais do seu projeto Supabase:
   ```bash
   cp .env.example .env.local
   ```

3. Instale as dependencias:
   ```bash
   npm install
   ```

---

## Execucao Local

```bash
npm run dev
```

O servidor de desenvolvimento sera iniciado em [http://localhost:3000](http://localhost:3000).

---

## Execucao via Docker

Para ambientes de producao ou infraestrutura da UFPE, recomenda-se a execucao via container Docker:

```bash
docker compose up -d --build
```

A aplicacao sera compilada em modo `standalone` (imagem Alpine Linux otimizada) e iniciara na porta `3000`.

Para verificar o status:
```bash
docker compose ps
```

Para visualizar os logs:
```bash
docker compose logs -f jjcac-web
```

---

## Codigo de Convite para Administradores

O sistema utiliza um codigo de convite para proteger o cadastro de contas com permissao de Administrador (Professor). Sem esse codigo, nao e possivel criar contas administrativas.

**Codigo de convite padrao:** `MESTRE2026`

Para utiliza-lo:

1. Acesse a tela de cadastro (`/signup`).
2. Selecione o perfil **"Professor / Administrador"**.
3. Insira o codigo de convite `MESTRE2026` no campo correspondente.
4. Preencha os dados e conclua o cadastro.

O codigo pode ser alterado a qualquer momento definindo a variavel de ambiente `INVITE_CODE_ADMIN` no arquivo `.env.local`. Se a variavel nao estiver definida, o sistema utilizara o codigo padrao acima.

---

## Credenciais de Teste

Para fins de avaliacao, os seguintes usuarios estao pre-configurados no banco de dados:

| Perfil | E-mail | Senha |
|---|---|---|
| Monitor (Professor auxiliar) | `monitor@teste.com` | `Cacprofessor@` |
| Aluno | `aluno_test_access@gmail.com` | `Cacaluno@` |

Para criar uma conta de Administrador, utilize o codigo de convite `MESTRE2026` conforme descrito na secao anterior.

---

## Estrutura do Banco de Dados

O script SQL completo para criacao do banco de dados esta disponivel em:

**[`docs/SCHEMA_COMPLETO.sql`](docs/SCHEMA_COMPLETO.sql)**

Este arquivo contem toda a estrutura necessaria para implantacao em um projeto Supabase novo, incluindo:

- Tipos enumerados (enums)
- Definicao de todas as tabelas com constraints
- Indices de performance
- Funcoes auxiliares e triggers
- Politicas de Row Level Security (RLS)
- Dados iniciais (seed) dos 32 principios do Jiu-Jitsu

Para implantar, basta criar um projeto no Supabase, acessar o SQL Editor e executar o conteudo completo do arquivo.

---

## Documentacao Complementar

A documentacao tecnica e operacional encontra-se na pasta `/docs`:

| Documento | Descricao |
|---|---|
| [Manual do Usuario](docs/MANUAL_USUARIO.md) | Instrucoes de uso do sistema e credenciais de acesso para testes |
| [Guia de Implantacao](docs/DEPLOY.md) | Procedimentos para deploy em nuvem (Vercel) ou infraestrutura local (Docker) |
| [Arquitetura do Sistema](docs/ARQUITETURA.md) | Decisoes tecnicas de design e diagrama da arquitetura |
| [Schema do Banco de Dados](docs/SCHEMA_COMPLETO.sql) | Script SQL completo para criacao do banco no Supabase |

---

## Licenca

Projeto academico desenvolvido no ambito do programa de extensao universitaria da UFPE. Uso restrito ao contexto institucional.
