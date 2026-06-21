# Arquitetura do Sistema JJCAC

O sistema JJCAC adota uma arquitetura moderna baseada em **Serverless, Edge Computing e BaaS (Backend as a Service)**, eliminando a necessidade de manter servidores monolíticos tradicionais para APIs. Todo o código do projeto reside em um monorepo unificado.

## 1. Visão Geral (Diagrama)

```mermaid
graph TD
    subgraph Frontend [Camada de Apresentação (Next.js - Client)]
        UI[Componentes React & UI]
        Hooks[React Hooks & Estado]
    end

    subgraph Backend [Camada de Lógica (Next.js - Server)]
        SA[Server Actions]
        API[API Routes / Edge]
        AuthMid[Middleware de Autenticação e RBAC]
    end

    subgraph Database [Camada de Dados (Supabase)]
        PG[(PostgreSQL + RLS)]
        Auth[GoTrue Auth]
        REST[PostgREST]
    end

    UI -->|Chamadas RPC/Form Action| SA
    Hooks -->|Verificação| AuthMid
    SA -->|Supabase SSR Client| REST
    AuthMid -->|Sessões JWT| Auth
    REST --> PG
    Auth --> PG
```

## 2. Decisões Arquiteturais

### 2.1 Next.js App Router (Fullstack)
Utilizamos o **Next.js 16** não apenas como renderizador de páginas, mas como o próprio Backend da aplicação. 
- **Server Actions:** Toda a lógica de negócio (ex: check-ins, aprovação de faixa, atualizações de perfil) é executada diretamente no servidor através de Server Actions, contidas na pasta `/src/actions`. Isso minimiza o código boilerplate de APIs REST e garante Typescript de ponta a ponta.
- **Middleware Centralizado:** A proteção das rotas, baseada em Roles (Admin, Monitor, Aluno), é validada centralmente através do `/src/middleware.ts` operando no nível de Edge Computing.

### 2.2 Supabase (BaaS)
O **Supabase** atua como nosso banco de dados, provedor de autenticação e API de dados em tempo real.
- **Segurança Nativa (RLS):** Toda a segurança dos dados está configurada na camada do banco de dados através de *Row Level Security* (RLS). Mesmo que o frontend permita uma chamada indevida, o banco rejeitará a operação baseando-se no ID (JWT) do usuário.

### 2.3 PWA e Sincronização Offline
- **IndexedDB:** Dados críticos de presença são mantidos em IndexedDB e sincronizados assincronamente com o servidor assim que a conexão de rede é restabelecida.
- **HMAC QR Codes:** Tokens rotativos de presença gerados temporariamente com assinatura local HMAC-SHA256, impedindo fraudes comuns em sistemas de QR Code estáticos.

## 3. Topologia de Entrega (Docker)

Para fins de implantação na UFPE, fornecemos uma topologia baseada em **Docker**.
A imagem gerada é uma etapa "Multi-stage" Alpine Linux que reduz o pacote final para a execução apenas dos artefatos estáticos e do servidor Node.js otimizado (`standalone`). O container Docker atua como a interface Fullstack que se conecta de forma segura aos serviços do Supabase na nuvem.
