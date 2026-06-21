# Sprint 0: Artifact 03 - API Contract (Server Actions View)

Nesta arquitetura Next.js (App Router) + Supabase, a "API" será construída primariamente através de **React Server Actions**, garantindo segurança no lado do servidor e tipagem forte ponta-a-ponta (TRM - Type-Safe Rendering Model).

## 1. Módulo de Autenticação (`actions/auth.ts`)

| Action | Parâmetros (Zod) | Retorno (Zod / JSON) | Regras Básicas |
| :--- | :--- | :--- | :--- |
| `signUp` | `{ email, password, full_name, category }` | `{ success, error }` | Cria usuário no Supabase Auth. Trigger cria o Profile como `pending_approval`. |
| `signIn` | `{ email, password }` | `{ success, error, role }` | Faz login e redireciona (Student -> `/student`, Teacher -> `/teacher`). |
| `signOut` | `void` | `{ success }` | Invalida a sessão. |

## 2. Módulo de Estudantes (`actions/students.ts`)

| Action | Parâmetros (Zod) | Retorno (Zod / JSON) | Regras Básicas (RLS/Server) |
| :--- | :--- | :--- | :--- |
| `listPending` | `void` | `Profile[]` | Requer role='teacher'. Retorna perfis com `status = pending_approval`. |
| `listAll` | `void` | `Profile[]` | Requer role='teacher'. Retorna todos (para gestão). |
| `approveStudent` | `profileId: string` | `{ success, error }` | Requer role='teacher'. Atualiza status para `active`. Dispara notificação? |
| `updateProfile`| `{ profileId, role, category }` | `{ success, error }` | Requer role='teacher'. Pode promover aluno a 'teacher'. |

## 3. Módulo de Check-in (`actions/checkins.ts`)

| Action | Parâmetros (Zod) | Retorno (Zod / JSON) | Regras Básicas (RLS/Server) |
| :--- | :--- | :--- | :--- |
| `registerCheckIn` | `{ qrPayload: string }` | `{ success, error }` | Requer role='student' AND status='active'. Verifica se qrPayload é o CT oficial. Tenta inserir registro com a data/hora atual. Supabase RLS / restrição de banco (UNIQUE index) bloqueia check-in duplicado. |
| `getMyCheckIns` | `void` | `CheckIn[]` | Requer estar logado. Retorna histórico do aluno logado. |
| `getDashStats` | `void` | `{ totalStudents, todayCheckIns, pending }` | Requer role='teacher'. Retorna agregado para o dashboard do professor. |

---
**Protocolo:** TRM/Prisma
**Status:** Agendado para implementação.
