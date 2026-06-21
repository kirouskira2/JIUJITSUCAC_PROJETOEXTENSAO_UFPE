# Sprint 0: Artifact 04 - Component Architecture e UI Flow

De acordo com o protocolo Prisma TRM e focando em simplicidade e "Single-View Constraint" por contexto, o aplicativo será dividido estruturalmente entre áreas Públicas, de Aluno e de Professor.

## 1. Árvore de Rotas (Next.js App Router)

```text
/app
 ├── (public)
 │    ├── page.tsx               # Landing Page simples (Logo CAC, Login/Signup)
 │    ├── login/page.tsx         # Formulário de Login
 │    └── signup/page.tsx        # Formulário de Cadastro (Nome, Email, Categoria)
 │
 ├── (protected)
 │    ├── layout.tsx             # Proteção de Rota + App Shell (Header simples, Botão de Sair)
 │    │
 │    ├── student/               # ÁREA DO ALUNO (Default após login se role=student)
 │    │    ├── page.tsx          # Tela Única: Câmera de captura do QR / Status "Pendente" / Histórico
 │    │
 │    └── teacher/               # ÁREA DO PROFESSOR (Default após login se role=teacher)
 │         ├── page.tsx          # Dashboard (Estatísticas: Ativos, Check-ins Hoje)
 │         ├── students/page.tsx # Tabela de gestão e lista de Pendentes
```

## 2. Componentes UI Base (shadcn/ui a importar)
- `Button`, `Input`, `Label` (Formulários)
- `Card`, `CardHeader`, `CardTitle`, `CardContent` (Layouts focais)
- `Table` ou `List` (Listagem de aprovado/pendente)
- `Badge` (Indicadores visuais de status: Pendente(Amarelo), Ativo(Verde), Professor(Roxo))
- `Toast` (Sonner - feedbacks de sucesso/erro essenciais para o fluxo móvel)

## 3. Fluxo Funcional (User Flow)

1. **Aluno recém-cadastrado:** 
   O Aluno acessa `/signup`, cadastra. Ao ser redirecionado para `/student`, a interface deve esconder o Scanner de QR Code e exibir um imenso *Card de Aviso*: "Cadastro em Avaliação. Aguarde a aprovação do professor responsável."
2. **Professor loga no sistema:**
   Acessa `/teacher`. Vê um Badge numérico piscando: "3 cadastros pendentes". Clica no botão e, de forma direta, aprova os que reconhece.
3. **Aluno Aprovado loga novamente:**
   Acessa `/student`. Vê a interface da câmera liberada (estilo componente `html5-qrcode` configurado para câmera traseira), escaneia o QR impresso na parede do tatame. Retorno visual instantâneo: *"Check-in Confirmado, OSS!"*.
4. **Relatórios (Futuro):** 
   O professor, no seu dashboard, poderá filtrar "Mês de Maio" para gerar a declaração de presença de categoria Acadêmicos.

---
**Protocolo:** TRM/Prisma
**Status:** Agendado para implementação.
