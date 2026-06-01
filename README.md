# JJCAC — Jiu-Jitsu para Todos 🥋

> **JJCAC** é um sistema moderno de gestão de presenças e controle de aulas, desenvolvido especificamente para o projeto de extensão universitária de Jiu-Jitsu da **UFPE (Universidade Federal de Pernambuco)**.

O sistema foi concebido como um aplicativo web progressivo (**PWA**) focado em máxima estabilidade, facilidade de uso diretamente no tatame através de QR Codes criptografados e suporte a sincronização offline.

---

## ✨ Recursos Principais

*   **PWA Integrado:** Pode ser instalado no celular de alunos e professores, funcionando como um app nativo.
*   **Check-in Inteligente via QR Code:**
    *   Geração dinâmica de QR Codes assinados com HMAC-SHA256 para evitar fraudes (check-in de fora do tatame).
    *   Validação de higiene obrigatória antes da confirmação da presença.
*   **Funcionamento 100% Offline (IndexedDB):**
    *   Se o tatame estiver sem conexão com a internet, o check-in é salvo no navegador do aluno via IndexedDB.
    *   Sincronização em segundo plano automática assim que o dispositivo recuperar a conexão.
*   **Gerenciamento Administrativo (RBAC):**
    *   Painéis distintos para Alunos, Professores (Monitores) e Administradores.
    *   Visualização de relatórios de presença, gestão de alunos ativos, suspensão de cadastros e auditoria de registros.
*   **Segurança Avançada:**
    *   Políticas RLS (Row Level Security) aplicadas em todas as tabelas do Supabase.
    *   Cabeçalhos HTTP de segurança rigorosos (CSP, HSTS, X-Frame-Options, etc.).
    *   Validação server-side e proteção contra ataques de força bruta.

---

## 🛠️ Stack Tecnológica

*   **Framework:** [Next.js 16 (App Router)](https://nextjs.org/) + TypeScript
*   **Estilização:** CSS Vanilla com design moderno e responsivo (Dark Mode nativo)
*   **Banco de Dados & Autenticação:** [Supabase](https://supabase.com/) (PostgreSQL)
*   **Sincronização Offline:** IndexedDB nativo (via `idb` wrapper leve)
*   **Segurança de QR Code:** Assinatura HMAC (criptografia SHA256)
*   **Containerização:** Docker + Docker Compose

---

## 🚀 Como Executar Localmente

### 1. Pré-requisitos
*   [Node.js 22+](https://nodejs.org/)
*   [Docker](https://www.docker.com/) (opcional, caso queira rodar via container)

### 2. Configurando o Ambiente
Copie o arquivo `.env.example` para `.env.local` e preencha as credenciais:
```bash
cp .env.example .env.local
```

### 3. Rodando em Modo de Desenvolvimento
Instale as dependências e inicie o servidor local:
```bash
npm install
npm run dev
```
Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

### 4. Rodando via Docker (Recomendado para Produção/TI UFPE)
Para subir o sistema rapidamente em um container isolado:
```bash
docker compose up -d --build
```
A aplicação iniciará de forma autônoma na porta `3000`.

---

## 📂 Guias Adicionais e Implantação

Para entender detalhes sobre como implantar o sistema em produção (seja na nuvem da **Vercel** ou na infraestrutura própria da **UFPE**), consulte o:

👉 **[Guia de Implantação (DEPLOY.md)](file:///c:/Users/pedro/Desktop/3.1%20prisma/prismaingles/temp_prisma_app/DEPLOY.md)**
