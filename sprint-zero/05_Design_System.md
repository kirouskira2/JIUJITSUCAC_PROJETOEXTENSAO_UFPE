# Sprint 0: Artifact 05 - Design System & UX Strategy

De acordo com a solicitação por um perfil **acadêmico e atual (moderno)**, o design do sistema deve transmitir seriedade (ambiente universitário/extensão) mesclada com a dinamicidade do esporte (Jiu Jitsu). A interface não deve parecer um sistema legado acadêmico, mas sim um app moderno de alta performance (UI minimalista e responsiva).

## 1. Identidade Visual (Mood & Colors)

*   **Mood:** Limpo, disciplinado, moderno e confiável. Escala de cinzas (Slate/Zinc) como base, com cores semânticas para facilitar a leitura rápida de status.
*   **Typography:**
    *   *Headings (Títulos):* **Space Grotesk** ou **Inter** (peso bold) — para um visual técnico, moderno e atlético.
    *   *Body (Texto Padrão):* **Inter** — excelência em legibilidade tanto em telas de celular (mobile) sob luz forte quanto no desktop do professor.
*   **Esquema de Cores Base (Tailwind):**
    *   **Background:** Off-white (`bg-slate-50`) no Light Mode e Preto fosco no Dark Mode (se habilitado). Foco total no layout limpo estilo "App da Apple" ou aplicativos fitness modernos.
    *   **Primary:** Azul Escuro ou Preto/Slate (`bg-slate-900`) garantindo alto contraste e seriedade.

## 2. Diferenciação Visual (Acadêmico vs. Comunidade)

Para facilitar a gestão do Professor na Dashboard, usaremos distintivos visuais (Badges) claros atrelados à categoria atual do perfil:

*   **Perfil Acadêmico (Alunos UFPE):**
    *   Cor de destaque: **Azul** (ex: `text-blue-600`, `bg-blue-100`).
    *   *Sinergia:* Representa o corpo institucional e a documentação acadêmica prioritária.
*   **Perfil Comunidade (Externos):**
    *   Cor de destaque: **Roxo / Índigo** (ex: `text-indigo-600`, `bg-indigo-100`).
    *   *Sinergia:* Representa a extensão e conexão do projeto com a comunidade externa.

## 3. Experiência do Usuário (UX - Mobile First)

Como o core do check-in ocorre no tatame via celular:

1.  **Foco Absoluto (Zero Ruído):** A tela do *Aluno Ativo* ao abrir o app não terá menus complexos. Haverá uma grande e visível chamada para ação (CTA): **"Escanear QR Code de Aula"** centralizado na tela.
2.  **Feedback Sensorial & Visual:** 
    *   Ao escanear com sucesso, a interface exibe um "Visto" (Check) verde gigante e um aviso amigável "Presença Confirmada, Bom Treino!".
    *   Pode incluir uma vibração tátil (haptic feedback, se o navegador permitir) ao ler o QR.
3.  **Painel do Professor (Admin UX):**
    *   Para o Professor (Acesso via Tablet/Desktop/Mobile).
    *   Cards superiores simples (Total Alunos, Presentes Hoje, Cadastros Pendentes).
    *   Tabela fluída com busca instantânea pelo nome do aluno e abas para separar (Todos / Acadêmicos / Comunidade).

## 4. UI Components (Base shadcn/ui)

*   `Badge`: Usado ostensivamente para mostrar *Status* (Pendente/Ativo) e *Categoria* (Acadêmico/Comunidade).
*   `Card`: O aplicativo usará "bento box" (cards minimalistas) para organizar informações sem poluir a tela.
*   `Toast (Sonner)`: Mensagens efêmeras no topo do celular ("Cadastro aguardando aprovação") sem travar a navegação.

---
**Protocolo:** TRM/Prisma
**Status:** Aguardando validação do usuário.
