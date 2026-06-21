# Sprint 0: Análise de Domínio - Jiu Jitsu CAC

## 1. Visão Geral do Projeto
O **Jiu Jitsu CAC** é um projeto de extensão universitária gratuito (vinculado à UFPE). O sistema visa digitalizar o controle de frequência e gestão de alunos, substituindo possíveis controles manuais por uma solução via aplicativo web responsivo.

## 2. Atores do Sistema

### 2.1 Aluno (Usuário Padrão)
* **Cadastro:** Realiza o cadastro informando dados (nome, email, senha, categoria - acadêmico ou comunidade, etc.).
* **Acesso Inicial:** O cadastro fica com status "Pendente" até a aprovação de um Professor.
* **Ações Principais:**
  * Após aprovação, acessa o sistema.
  * Utiliza a câmera do próprio celular para escanear um **QR Code Estático** fixado no Centro de Treinamento (CT).
  * O escaneamento registra a sua presença no dia do treino.

### 2.2 Professor (Administrador)
* **Acesso:** Possui um painel administrativo (Dashboard).
* **Gestão de Alunos:**
  * Recebe notificações visuais sobre novos cadastros pendentes.
  * Aprova o primeiro acesso de novos alunos.
  * Visualiza, edita perfil de alunos e pode alterar a categoria/status.
  * Pode promover um Aluno a Professor (transformar em Admin).
* **Gestão de Aulas/Dias:** 
  * As aulas ocorrem fixamente às **Segundas e Quintas-feiras**. O sistema pode registrar a presença vinculada automaticamente ao dia atual.
  * (Opcional no futuro) Criar eventos extraordinários ou gerir um calendário, mas focado no fluxo simples inicial.
* **Relatórios:** Acesso aos dados para posterior geração de documentos ou prestação de contas de horas extracurriculares para a universidade.

## 3. Regras de Negócio Iniciais
1. **Confiança (Good Faith):** O QR Code no CT será estático. Como o projeto é gratuito e os alunos precisam do aval do professor para obter os certificados/documentos finais, confia-se que o aluno só irá escanear o QR presencialmente no CT (sem excesso de bloqueios de geolocalização no MVP).
2. **Aprovação Obrigatória:** O aluno só pode registrar presenças e ver o ambiente interno após o professor aprovar seu cadastro.
3. **Check-in Unitário:** O sistema deverá permitir que o aluno registre a presença apenas uma vez por dia de treino.

## 4. Requisitos Não-Funcionais
* **Dispositivos:** Mobile-first (foco em funcionar bem no celular do aluno para leitura do QR).
* **Tecnologia Stack:** Next.js (SPA/PWA), Supabase (Auth + Banco de Dados + RLS para segurança).
* **Interface:** Interface limpa e minimalista. TailwindCSS + shadcn/ui.

---
**Status:** Aguardando validação do usuário.
