# Sprint 0: Artifact 06 - Implementation Plan

Com a base teórica e de design validadas, este é o plano de execução para a contrução do projeto "Jiu Jitsu CAC". O desenvolvimento será focado e dividido em fases lógicas.

## Fase 1: Setup & Conexão Inicial (Foundation)
1. **Infraestrutura:** Manter a base Next.js (App Router) e instalar Shadcn/UI (Cards, Buttons, Inputs, Badges, Sonner).
2. **Banco de Dados (Supabase):** Executar no Supabase o script SQL `02_Schema_SQL.sql` para criar as tabelas `profiles` e `check_ins`, configurando os Enums e ativando as regras de segurança (RLS - Row Level Security).
3. **Autenticação:** Configurar o cliente web e os hooks do Supabase SSR no Next.js (Server Actions) para permitir Login e Cadastro.

## Fase 2: Módulo de Autenticação & UX de Bloqueio
1. **Público:** Desenvolver Landing Page simples, telas de Login (`/login`) e Cadastro (`/signup`).
2. **Onboarding do Aluno:** 
   - Ao se cadastrar, o aluno entra como `pending_approval`.
   - Adicionar trava na rota (`/student`): Se pendente, exibir bloqueio visual amigável: *"Aguardando liberação pelo Professor."*

## Fase 3: Área do Professor (Dashboard Admin)
1. **Overview:** Construção do painel analítico (`/teacher`).
2. **Gestão de Alunos:** 
   - Tabela listando todos os alunos com Badges de Categoria (Acadêmico/Comunidade).
   - Sessão de "Aprovações Pendentes" com botões de aprovar/rejeitar (chamada para as Server Actions).
3. **Ações CRUD:** Permitir que o professor altere roles (tornar outro usuário professor) ou atualize a categoria acadêmica de um aluno.

## Fase 4: O "Check-in" do Aluno (Core Feature)
1. **Câmera:** Integrar um leitor de QR Code usando bibliotecas Web leves e estáveis (ex: `html5-qrcode` ou implementações modernas via navite capabilities).
2. **Scanner View:** Tela full-screen mobile (`/student`) focada no leitor. 
3. **Ação de Check-in:** Ao let o QR estático do CT (uma string específica), enviar para o servidor, registrar na tabela `check_ins` contornando a regra UNIQUE (que impede 2 check-ins no mesmo dia para a mesma pessoa).
4. **UX Sensory:** Utilizar `toast` (Sonner) verde gigante para dar o feedback "Presença Confirmada!" ao final do treino.

---
**Status:** Validação Final do Sprint 0.

Com este documento mapeado, estamos prontos para encerrar o Planejamento e iniciar a codificação (Modo Engenharia). Você concorda com este plano e está pronto para autorizar a limpeza da interface e início das tabelas reais?
